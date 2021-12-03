import { getOnlineMembersInRoom } from './../utils/socket';
import { Team } from '@prisma/client';
import create from 'http-errors';
import { DEFAULT_LIMIT_COUNT, DEFAULT_OFFSET_COUNT } from './../utils/contants';
import { IPublicUserProfile } from './../models/IUserPublicProfile';
import { db } from '../db';
import { MemberType, Log, Avatar, TeamMember } from '.prisma/client';
import { admin, auth } from '../firebase';
import { uploadToBucket } from '../utils/users';

export const getUserTeams = async (userId: string) => {
    let teams = db.teamMember.findMany({
        where: {
            user_id: userId
        },
        include: {
            team: {
                select: {
                    team_name: true
                }
            },
        }
    });

    if (!teams) {
        return [];
    } else return teams;
}

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

    return channels.map((c) => {
        let onlineMembers = getOnlineMembersInRoom(c.channel.channel_id);
        let owner_username = "admin";
        const owner = c.channel.members.find((m) => m.type === MemberType.Owner);
        const is_owner = owner && owner.user_id === id;
        const newOnlineMembers = [];
        for (let i = 0; i < onlineMembers.length; i++) {
            const member = c.channel.members.find((cm) => cm.user_id === onlineMembers[i].userId);
            if (member) {
                newOnlineMembers.push(
                    {
                        status: onlineMembers[i].status,
                        username: member.member.profile!.username,
                        avatarUrl: member.member.profile!.avatar_url,
                    }
                );
            }
        }

        if (owner) {
            owner_username = owner.member.profile!.username;
        }

        return {
            name: c.channel.name,
            index: c.channel.index,
            channel_type: c.channel.type,
            channel_id: c.channel.channel_id,
            online_members: newOnlineMembers,
            owner_username,
            is_owner: is_owner ? true : false,
        }
    });
};

export const getUserLogs = async (userId: string, offset: number, limit: number): Promise<Log[]> => {
    const user = await db.profile.findUnique({
        where: {
            user_id: userId
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
        const payload = {
            displayName: username
        } as { displayName: string, photoURL: string };

        if (avatarUrl) {
            payload.photoURL = avatarUrl
        }

        const newUser = await admin.auth().updateUser(userId, payload);

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

export const getUserAvatars = async (userId: string): Promise<Avatar[]> => {
    const avatars = await db.avatar.findMany({
        where: {
            OR: [
                { user_id: userId },
                { isPublic: true }
            ]
        }
    });

    return avatars;

}

export const uploadAndUpdateUserAvatar = async (userId: string, file: Express.Multer.File) => {

    const { url, bucketFile } = await uploadToBucket(userId, file);

    if (!url) {
        throw new create.InternalServerError('An error has occurred while uploading avatar');
    }

    const uploadedAvatar = await db.avatar.create({
        data: {
            user_id: userId,
            isPublic: false,
            avatar_url: url
        }
    });

    if (!uploadedAvatar) {
        bucketFile.delete({ ignoreNotFound: true }, (err) => {
            if (err) {
                throw new create.InternalServerError(err.message);
            }

            throw new create.InternalServerError('An error occurred while uploading the file. Operation reverted.');
        });
    } else {
        const previousProfile = await db.profile.findUnique({
            where: { user_id: userId }
        });

        if (!previousProfile) {
            await db.avatar.delete({
                where: {
                    avatar_id: uploadedAvatar.avatar_id
                }
            });

            bucketFile.delete({ ignoreNotFound: true }, (err) => {
                if (err) {
                    throw new create.InternalServerError(err.message);
                }

                throw new create.InternalServerError('An error occurred while uploading the file. Operation reverted.');
            });
        }

        const updatedProfile = await db.profile.update({
            where: {
                user_id: userId,
            },
            data: {
                avatar_url: uploadedAvatar.avatar_url
            }
        });

        if (!updatedProfile) {
            await db.avatar.delete({
                where: {
                    avatar_id: uploadedAvatar.avatar_id
                }
            });

            bucketFile.delete({ ignoreNotFound: true }, (err) => {
                if (err) {
                    throw new create.InternalServerError(err.message);
                }

                throw new create.InternalServerError('An error occurred while uploading the file. Operation reverted.');
            });
        } else {
            const updatedAuthProfile = await auth.updateUser(userId, {
                photoURL: updatedProfile.avatar_url
            });

            if (!updatedAuthProfile) {
                await db.avatar.delete({
                    where: {
                        avatar_id: uploadedAvatar.avatar_id
                    }
                });

                await db.profile.update({
                    where: {
                        user_id: userId
                    },
                    data: {
                        avatar_url: previousProfile!.avatar_url
                    }
                });

                bucketFile.delete({ ignoreNotFound: true }, (err) => {
                    if (err) {
                        throw new create.InternalServerError(err.message);
                    }

                    throw new create.InternalServerError('An error occurred while uploading the file. Operation reverted.');
                });
            } else {
                throw new create.InternalServerError('Avatar uploaded successfully and updated user avatar!');
            }

        }
    }
}