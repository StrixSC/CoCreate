import { IPublicUserProfile } from './../models/IUserPublicProfile';
import { db } from '../db';
import { MemberType } from '.prisma/client';

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

export const getSinglePublicProfileByUsername = async (
    uname: string
): Promise<IPublicUserProfile | null> => {
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

export const getSinglePublicProfileById = async (
    uid: string
): Promise<IPublicUserProfile | null> => {
    const profile = await db.profile.findFirst({
        select: {
            username: true,
            avatar_url: true
        },
        where: {
            user_id: uid
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

export const getUserChannelsById = async (id: string): Promise<any> => {
    const channels = await db.channelMember.findMany({
        where: {
            user_id: id
        },
        select: {
            type: true,
            channel: {
                select: {
                    channel_id: true,
                    name: true,
                    type: true
                }
            }
        }
    });

    return channels.map((c) => ({
        ...c.channel,
        is_owner: c.type === MemberType.Owner ? true : false
    }));
};
