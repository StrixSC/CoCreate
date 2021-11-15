import { DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT, englishLongMonths } from './../../utils/drawings';
import { db } from '../../db';
import moment from 'moment';
import 'moment/locale/fr';

const getBeginAndEndFromMonth = (m: string) => {
    const month = m.toLowerCase();
    const isEnglish = englishLongMonths.includes(month);
    moment.locale('en');
    if (!isEnglish) {
        moment.locale('fr');
    }

    const monthNumber = parseInt(moment().month(month).format("M"), 10);
    const startDate = moment([new Date().getFullYear(), monthNumber - 1]);
    const endDate = moment(startDate).endOf('month');
    moment.locale('en');
    return {
        start: startDate.toDate(),
        end: endDate.toDate()
    }

}

export const filterByMonth = async (filter: string, offset: number, limit: number): Promise<any[]> => {
    const monthBeginEnd = getBeginAndEndFromMonth(filter);
    const filteredDrawings = await db.drawing.findMany({
        where: {
            OR: {
                created_at: {
                    gte: monthBeginEnd.start,
                    lte: monthBeginEnd.end,
                },
            }
        },
        include: {
            collaboration: {
                include: {
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
                },
            }
        },
        skip: offset || DEFAULT_DRAWING_OFFSET,
        take: limit || DEFAULT_DRAWING_LIMIT
    });

    return filteredDrawings;

}