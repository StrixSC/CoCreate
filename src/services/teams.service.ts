import axios from 'axios';
import { MemberType, TeamType } from "@prisma/client";
import { db } from "../db";
import { GetTeamsPayload, TeamQueryInterface } from "../models/Teams.model";
import { mascotTranslator } from "../utils/teams";
import moment from "moment";
import create from "http-errors";

export const getTeams = async (data: GetTeamsPayload) => {
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

export const getTeamsWithFilter = async (data: GetTeamsPayload) => {
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
                // Team Bio
                team.bio.toLowerCase(),
                // Team mascot
                team.mascot.toLowerCase(),
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
                team.type.toLowerCase(),
                // Translated mascot:
                mascotTranslator(team.mascot),
            ]
        });

        // Type in french:
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

export const filterTeamsByParams = (result: TeamQueryInterface, userId: string, removeFull: boolean | null, amMember: boolean | null, amOwner: boolean | null) => {
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

export const generateMascotProfile = async (mascot: string): Promise<{ avatarUrl: string, redirectedAvatarUrl: string }> => {
    const avatarUrl = "https://source.unsplash.com/random/300x300/?" + mascot;
    let redirectedAvatarUrl = "";
    try {
        const response = await axios.get(avatarUrl);

        if (response) {
            redirectedAvatarUrl = response.request.res.responseUrl;
        }
        return { avatarUrl, redirectedAvatarUrl }
    } catch (e) {
        return { avatarUrl, redirectedAvatarUrl }
    }
}

export const getNewMascotUrl = async (avatarUrl: string): Promise<string> => {
    let redirectedAvatarUrl = "";
    try {
        const response = await axios.get(avatarUrl);
        if (response) {
            redirectedAvatarUrl = response.request.res.responseUrl;
        }
        return redirectedAvatarUrl;
    } catch (e) {
        return redirectedAvatarUrl;
    }
}