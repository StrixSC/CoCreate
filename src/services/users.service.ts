import create from 'http-errors';
import { DEFAULT_LIMIT_COUNT, DEFAULT_OFFSET_COUNT } from './../utils/contants';
import { IPublicUserProfile } from './../models/IUserPublicProfile';
import { db } from '../db';
import { MemberType, Log } from '.prisma/client';
import { admin } from '../firebase';

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
                    type: true,
                    index: true,
                    members: {
                        include: {
                            member: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!channels) {
        return [];
    }

    return channels.map((c) => ({
        name: c.channel.name,
        index: c.channel.index,
        channel_id: c.channel.channel_id,
        owner_username:
            c.channel.members.find((m) => m.type === MemberType.Owner)?.member.profile?.username ||
            'Admin',
        is_owner: c.type === MemberType.Owner ? true : false
    }));
};

export const getUserLogs = async (username: string, offset: number, limit: number): Promise<Log[]> => {
    const user = await db.profile.findUnique({
        where: {
            username: username
        }
    });

    if (!user) {
        throw new create.NotFound('No user found with this username');
    }

    const logs = await db.log.findMany({
        where: {
            user_id: user.user_id
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: offset || DEFAULT_OFFSET_COUNT,
        take: limit || DEFAULT_LIMIT_COUNT
    });

    return logs;
};

export const updateUserProfile = async (userId: string, username: string, avatarUrl: string) => {
    const [originalUser, updatedUser] = await db.$transaction([
        db.profile.findUnique({ where: { user_id: userId } }),
        db.profile.update({
            where: {
                user_id: userId
            },
            data: {
                username: username,
                avatar_url: avatarUrl
            }
        })
    ]);

    if (!originalUser || !updatedUser) {
        throw new create.InternalServerError('Could not update the user in the database');
    }

    if (updatedUser) {
        const newUser = await admin.auth().updateUser(userId, {
            displayName: username,
            photoURL: avatarUrl
        });

        if (newUser) {
            return {
                username: updatedUser.username,
                avatarUrl: updatedUser.avatar_url
            }
        } else {
            const revertedUser = await db.profile.update({
                where: {
                    user_id: userId
                },
                data: {
                    username: originalUser.username,
                    avatar_url: originalUser.avatar_url
                }
            });

            throw new create.InternalServerError("Something went wrong while processing the request. No information was updated.");
        }
    }
}