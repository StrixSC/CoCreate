import { DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT } from './../utils/drawings';
import create from 'http-errors';
import { MemberType, CollaborationType } from '.prisma/client';
import { db } from '../db';
import moment from 'moment';

export const getCollaborations = async (filter: string, offset: number, limit: number, type?: CollaborationType, userId?: string, excludeUser?: boolean) => {

    offset = offset ? offset : DEFAULT_DRAWING_OFFSET;
    limit = limit ? limit : DEFAULT_DRAWING_LIMIT;

    if (filter) {
        return getCollaborationsWithFilter(filter, offset, limit, type, userId, excludeUser);
    }

    let result = await db.collaboration.findMany({
        include: {
            drawing: true,
            collaboration_members: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            account: true
                        }
                    }
                }
            }
        },
        where: {
            type: {
                in: type
            },
            collaboration_members: {
                some: {
                    user_id: excludeUser ? undefined : userId
                },
                none: {
                    user_id: excludeUser ? userId : ''
                }
            }
        },
    });

    if (!result) {
        throw new create.InternalServerError("Error getting drawings from database");
    }

    return { collaborations: result.slice(offset, limit), offset: offset, limit, total: result.length };
};

export const getCollaborationsWithFilter = async (filter: string, offset: number, limit: number, type?: CollaborationType, userId?: string, excludeUser?: boolean) => {
    let allCollaborations = await db.collaboration.findMany({
        include: {
            drawing: true,
            collaboration_members: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            account: true
                        }
                    }
                }
            }
        },
        where: {
            type: {
                in: type
            },
            collaboration_members: {
                some: {
                    user_id: excludeUser ? undefined : userId
                },
                none: {
                    user_id: excludeUser ? userId : ''
                }
            }
        }
    });

    const filterMap = new Map<string, { index: number, data: string[] }>();

    for (let i = 0; i < allCollaborations.length; i++) {
        const collaboration = allCollaborations[i];
        let author = collaboration.collaboration_members.find((c: any) => c.type === MemberType.Owner);
        let allowSearching = author!.user.account!.allow_searching;

        if (!author) {
            continue;
        }

        const date = new Date(collaboration.created_at);
        const localLocale = moment(date);
        localLocale.locale('fr');

        filterMap.set(collaboration.collaboration_id, {
            index: i,
            data: [
                // Drawing Title
                collaboration.drawing!.title.toLowerCase(),
                // Year (NUMBER, ex.: 1901)
                date.getFullYear().toString(),
                // Month created (in number) (+1 because months in Date() are 0 based)
                (date.getMonth() + 1).toString(),
                // Month created (In text, example: novembre)
                localLocale.format('MMMM').toLowerCase(),
                // Day of the month created (in number, example: 31);
                date.getDay().toString(),
                // name of the day of the month created, (example: vendredi)
                localLocale.format('dddd').toLowerCase(),
                // Author username
                author.user.profile!.username.toLowerCase(),
                // Type
                collaboration.type.toLowerCase()
                // Type in french:
            ]
        });

        if (collaboration.type === CollaborationType.Protected) {
            filterMap.get(collaboration.collaboration_id)!.data.push('protégé');
            filterMap.get(collaboration.collaboration_id)!.data.push('protege');
            filterMap.get(collaboration.collaboration_id)!.data.push('protége');
            filterMap.get(collaboration.collaboration_id)!.data.push('protegé');
        } else if (collaboration.type === CollaborationType.Private) {
            filterMap.get(collaboration.collaboration_id)!.data.push('privé');
            filterMap.get(collaboration.collaboration_id)!.data.push('prive');
            filterMap.get(collaboration.collaboration_id)!.data.push('privée');
            filterMap.get(collaboration.collaboration_id)!.data.push('privee');
        } else if (collaboration.type === CollaborationType.Public) {
            filterMap.get(collaboration.collaboration_id)!.data.push('public');
            filterMap.get(collaboration.collaboration_id)!.data.push('publique');
        }

        if (allowSearching) {
            // First name
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.account!.first_name.toLowerCase());
            // Last Name
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.account!.last_name.toLowerCase());
            // Email
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.email.toLowerCase());
        }
    };

    const returnDrawings: any[] = [];

    for (let [key, entry] of filterMap) {
        for (let input of entry.data) {
            if (input.includes(filter)) {
                returnDrawings.push(allCollaborations[entry.index]);
                break;
            }
        }
    }

    return { collaborations: returnDrawings.slice(offset, limit), offset: offset, limit, total: returnDrawings.length };
}