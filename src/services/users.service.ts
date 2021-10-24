import { IUserComplete } from './../models/IUserComplete.model';
import { IPublicUserProfile } from './../models/IUserPublicProfile';
import { db } from '../db';

export const getAllPublicProfiles = async (
    offset: number,
    limit: number
): Promise<IPublicUserProfile[] | null> => {
    const profiles = await db.profile.findMany({
        select: {
            index: true,
            username: true,
            avatar_url: true
        },
        take: limit,
        skip: offset,
        orderBy: {
            index: 'asc'
        }
    });
    return profiles;
};

export const getSinglePublicProfile = async (uname: string): Promise<IPublicUserProfile | null> => {
    const profile = await db.profile.findFirst({
        select: {
            username: true,
            avatar_url: true
        },
        where: {
            username: uname
        }
    });

    return profile;
};

export const getCompleteUser = async (id: string): Promise<any> => {
    const user = await db.user.findFirst({
        select: {
            user_id: true,
            email: true,
            profile: {
                select: {
                    username: true,
                    avatar_url: true
                }
            },
            logs: {
                select: {
                    type: true,
                    created_at: true,
                    drawing_id: true
                }
            },
            account: {
                select: {
                    first_name: true,
                    last_name: true
                }
            },
            stats: {
                select: {
                    collaboration_count: true,
                    author_count: true,
                    active_team_count: true,
                    average_collaboration_time: true,
                    total_collaboration_time: true
                }
            }
        },
        where: {
            user_id: id
        }
    });

    return user;
};
