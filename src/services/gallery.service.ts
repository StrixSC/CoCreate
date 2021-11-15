import { daysArray, englishLongMonths, frenchLongMonths } from './../utils/drawings';
import create from 'http-errors';
import { MemberType } from '.prisma/client';
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

export const getDrawings = async (filter: string, offset: number, limit: number) => {
    if (filter) {
        return getDrawingsWithFilter(filter, offset, limit);
    }

    const result = await db.drawing.findMany({
        skip: offset,
        take: limit,
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
        }
    });

    if (!result) {
        throw new create.InternalServerError("Error getting drawings from database");
    }

    return result;
};

export const getDrawingsWithFilter = async (filter: string, offset: number, limit: number) => {
    const filterCategory = getFilterCategory(filter);
    const data = await filterCallback[filterCategory](filter, offset, limit);
    return data;
}

export const getFilterCategory = (filter: string): FilterType => {
    if (englishLongMonths.concat(frenchLongMonths).includes(filter.toLowerCase())) {
        return FilterType.Month
    }

    if (validator.isNumeric(filter)) {
        if (validator.isIn(filter, daysArray) && moment(filter).day()) {
            return FilterType.DayOrKeyword
        }

        if (moment(filter).year()) {
            return FilterType.YearOrKeyword
        }
    }

    if (validator.isDate(filter, { delimiters: ['-', '/', '.', ','] })) {
        return FilterType.Date
    }

    if (validator.isAlpha(filter)) {
        return FilterType.NameOrKeyword
    }

    if (validator.isAlphanumeric(filter)) {
        return FilterType.UsernameOrKeyword
    }

    return FilterType.Keyword
}