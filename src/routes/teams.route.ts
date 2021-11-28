import { DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT } from './../utils/drawings';
import { handleRequestError } from './../utils/errors';
import moment from 'moment';
import create from 'http-errors';
import { db } from './../db';
import { TeamType, MemberType, Team, Account, Profile, User } from '.prisma/client';
import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { Router, Response, Request, NextFunction } from 'express';
import { validationResult, matchedData } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const router = Router();

interface GetTeamsPayload {
    userId: string;
    type: TeamType | null;
    filter: string | null;
    offset: number;
    limit: number;
    removeFull: boolean | null;
    amOwner: boolean | null;
    amMember: boolean | null;
}

type TeamQueryInterface = (Team & {
    team_members: {
        type: MemberType;
        user_id: string;
        user: User & {
            profile: Profile | null;
            account: Account | null;
        };
    }[];
})[]

interface TeamResponse {
    teamId: string,
    createdAt: string,
    teamName: string,
    bio: string,
    maxMemberCount: number,
    type: string,
    avatarUrl: string,
    mascot: string,
    authorUsername: string,
    authorAvatarUrl: string,
}

router.get('/', checkIfAuthenticated, (req, res, next) => getTeamsController(req, res, next));

const getTeamsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const payload = {
            userId: req.userId,
            filter: data.filter,
            offset: data.offset,
            limit: data.limit,
            removeFull: data.removeFull,
            amOwner: data.amOwner,
            amMember: data.amMember
        } as GetTeamsPayload;

        if (!payload.offset) {
            payload.offset = DEFAULT_DRAWING_OFFSET;
        }

        if (!payload.limit) {
            payload.limit = DEFAULT_DRAWING_LIMIT;
        }

        const result = await getTeams(payload);

        return res.status(StatusCodes.OK).json({
            teams: result.teams.map((d) => {
                const author = d.team_members.find((tm) => (tm.type === MemberType.Owner));

                if (!author) {
                    return;
                };

                return {
                    authorUsername: author.user.profile!.username,
                    authorAvatarUrl: author.user.profile!.avatar_url,
                    avatarUrl: d.avatar_url,
                    bio: d.bio,
                    createdAt: d.created_at.toISOString(),
                    maxMemberCount: d.max_member_count,
                    teamId: d.team_id,
                    type: d.type,
                    mascot: d.mascot,
                    teamName: d.team_name,
                } as TeamResponse
            }),
            offset: result.offset,
            limit: result.limit,
            total: result.total
        })
    } catch (e) {
        handleRequestError(e, next);
    }
}

const getTeams = async (data: GetTeamsPayload) => {
    if (data.filter) {
        return getTeamsWithFilter(data);
    }

    const result = await db.team.findMany({
        where: {
            type: data.type ? data.type : undefined
        },
        orderBy: {
            created_at: 'desc'
        },
        include: {
            team_members: {
                select: {
                    type: true,
                    user_id: true,
                    user: {
                        include: {
                            profile: true,
                            account: true,
                        }
                    }
                },
            }
        }
    });

    if (!result) {
        throw new create.InternalServerError("Error getting drawings from database");
    }

    const filtered = filterTeamsByParams(result, data.userId, data.removeFull, data.amMember, data.amOwner);
    return { teams: filtered.slice(data.offset, data.limit + data.offset), offset: data.offset, limit: data.limit, total: filtered.length };
}

const getTeamsWithFilter = async (data: GetTeamsPayload) => {
    const result = await db.team.findMany({
        where: {
            type: data.type ? data.type : undefined
        },
        orderBy: {
            created_at: 'desc'
        },
        include: {
            team_members: {
                select: {
                    type: true,
                    user_id: true,
                    user: {
                        include: {
                            profile: true,
                            account: true,
                        }
                    }
                },
            }
        }
    });

    if (!result) {
        throw new create.InternalServerError("Error getting drawings from database");
    }

    const filtered = filterTeamsByParams(result, data.userId, data.removeFull, data.amMember, data.amOwner) as TeamQueryInterface;
    const filterMap = new Map<string, { index: number, data: string[] }>();

    for (let i = 0; i < filtered.length; i++) {
        const team = filtered[i];
        let author = team.team_members.find((c: any) => c.type === MemberType.Owner);

        if (!author) {
            continue;
        }

        let allowSearching = author!.user.account!.allow_searching;
        const date = new Date(team.created_at);
        const localLocale = moment(date);
        localLocale.locale('fr');

        filterMap.set(team.team_id, {
            index: i,
            data: [
                // Team Name
                team.team_name.toLowerCase(),
                // Year (NUMBER, ex.: 1901)
                date.getFullYear().toString(),
                // Month created (in number) (+1 because months in Date() are 0 based)
                (date.getMonth() + 1).toString(),
                // Month created (In text, example: novembre)
                localLocale.format('MMMM').toLowerCase(),
                // Day of the month created (in number, example: 31);
                localLocale.date().toString(),
                // Hour created (24H format)
                localLocale.hour().toString(),
                // Hour created (12H format)
                localLocale.format('hh').toString(),
                // Minutes
                localLocale.minutes().toString(),
                // name of the day of the month created, (example: vendredi)
                localLocale.format('dddd').toLowerCase(),
                // Author username
                author.user.profile!.username.toLowerCase(),
                // Type
                team.type.toLowerCase()
                // Type in french:
            ]
        });

        if (team.type === TeamType.Protected) {
            filterMap.get(team.team_id)!.data.push('protégé');
            filterMap.get(team.team_id)!.data.push('protege');
            filterMap.get(team.team_id)!.data.push('protége');
            filterMap.get(team.team_id)!.data.push('protegé');
        } else if (team.type === TeamType.Public) {
            filterMap.get(team.team_id)!.data.push('public');
            filterMap.get(team.team_id)!.data.push('publique');
        }

        if (allowSearching) {
            // First name
            filterMap.get(team.team_id)!.data.push(author.user.account!.first_name.toLowerCase());
            // Last Name
            filterMap.get(team.team_id)!.data.push(author.user.account!.last_name.toLowerCase());
            // Email
            filterMap.get(team.team_id)!.data.push(author.user.email.toLowerCase());
        }
    };

    const returnTeams: TeamQueryInterface = [];

    for (let [key, entry] of filterMap) {
        for (let input of entry.data) {
            if (data.filter) {
                if (input.includes(data.filter)) {
                    returnTeams.push(filtered[entry.index]);
                    break;
                }
            }
        }
    }

    return { teams: returnTeams.slice(data.offset, data.limit + data.offset), offset: data.offset, limit: data.limit, total: returnTeams.length };
}

const filterTeamsByParams = (result: TeamQueryInterface, userId: string, removeFull: boolean | null, amMember: boolean | null, amOwner: boolean | null) => {
    let filtered = [...result];
    if (removeFull) {
        filtered = [...filtered.filter((d: any) => d.max_member_count > d.team_members.length)];
    }

    if (amMember) {
        filtered = [...filtered.filter((d) => d.team_members.find((m: any) => m.user_id === userId))]
    }

    if (amOwner) {
        filtered = [...filtered.filter((d) => d.team_members.find((m: any) => m.user_id === userId && m.type === MemberType.Owner))]
    }

    return filtered;
}

export default router;
