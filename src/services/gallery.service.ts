import { daysArray, englishLongMonths, frenchLongMonths, DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT } from './../utils/drawings';
import create from 'http-errors';
import { MemberType, Drawing, Collaboration, CollaborationMember, CollaborationType } from '.prisma/client';
import { db } from '../db';
import validator from 'validator';
import { bilingualMonths, FilterType } from '../utils/drawings';
import moment from 'moment';
import { filterByMonth } from './filtered-gallery/month';

export const filterCallback: Record<FilterType, (filter: string, offset: number, limit: number) => Promise<any[]>> = {
    Month: async (filter, offset, limit) => await filterByMonth(filter, offset, limit),
    DayOrKeyword: async (filter, offset, limit) => await Promise.resolve([]),
    Date: async (filter, offset, limit) => await Promise.resolve([]),
    Keyword: async (filter, offset, limit) => await Promise.resolve([]),
    NameOrKeyword: async (filter, offset, limit) => await Promise.resolve([]),
    UsernameOrKeyword: async (filter, offset, limit) => await Promise.resolve([]),
    YearOrKeyword: async (filter, offset, limit) => await Promise.resolve([])
}

export const getCollaborations = async (filter: string, offset: number, limit: number) => {
    if (filter) {
        return getCollaborationsWithFilter(filter, offset, limit);
    }

    const result = await db.collaboration.findMany({
        skip: offset,
        take: limit,
        include: {
            drawing: true,
            collaboration_members: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            account: true,
                        }
                    }
                }
            }
        }
    });

    if (!result) {
        throw new create.InternalServerError("Error getting drawings from database");
    }

    return result;
};

export const getCollaborationsWithFilter = async (filter: string, offset: number, limit: number) => {
    const allCollaborations = await db.collaboration.findMany({
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
        }
    });

    const filterMap = new Map<string, { index: number, data: string[] }>();

    for (let i = 0; i < allCollaborations.length; i++) {
        const collaboration = allCollaborations[i];
        let author = collaboration.collaboration_members.find((c) => c.type === MemberType.Owner);
        let allowSearching = author!.user.account!.allow_searching;

        if (!author) {
            continue;
        }

        const date = new Date(collaboration.created_at);
        // moment.locale('fr-FR');
        var localLocale = moment(date);
        localLocale.locale('fr');
        filterMap.set(collaboration.collaboration_id, {
            index: i,
            data: [
                collaboration.drawing!.title,   // Drawing title
                date.getFullYear().toString(), // Year created
                (date.getMonth() + 1).toString(),    // Month created (in number) (+1 because months in Date() are 0 based)
                localLocale.format('MMMM'),
                // Intl.DateTimeFormat('', { month: "long" }).format(date).toLowerCase(), // Month created in text (fr-CA locale)
                date.getDay().toString(),   // Day created (day number)
                localLocale.format('dddd'),
                // date.toLocaleDateString("fr-FR", { weekday: 'long' }).toLowerCase(),   // Day created (day name)
                author.user.profile!.username,
                author.user.profile!.avatar_url
            ]
        });

        if (allowSearching) {
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.account!.first_name);
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.account!.last_name);
            filterMap.get(collaboration.collaboration_id)!.data.push(author.user.email);
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
        // console.log(returnDrawings);
        // return [];
    }

    return returnDrawings.slice(offset || DEFAULT_DRAWING_OFFSET, limit || DEFAULT_DRAWING_LIMIT);
}