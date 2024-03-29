import { getOnlineMembersInRoom } from './../utils/socket';
import { MemberType, ChannelType } from '.prisma/client';
import { ICompleteChannelData } from '../models/ICompleteChannelData.model';
import { IReceiveMessagePayload } from './../models/IReceiveMessagePayload.model';
import { ISendMessagePayload } from './../models/ISendMessagePayload.model';
import { IChannelIOPayload } from './../models/IJoinChannelPayload.model';
import { io } from '../bin/www';
import create, { InternalServerError } from 'http-errors';
import { db } from '../db';
import moment from 'moment';
import { IChannel } from '../models/IChannel.model';

export const getAllChannels = async (userId: string): Promise<IChannel[]> => {
    const channels = await db.channel.findMany({
        where: {
            type: ChannelType.Public
        },
        include: {
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
    });

    const returnVal = channels.map((c) => {
        const onlineMembers = getOnlineMembersInRoom(c.channel_id);
        let ownerUsername = "admin";
        let isMember = false;
        let isOwner = false;
        const owner = c.members.find((m) => m.type === MemberType.Owner);
        if (owner) {
            ownerUsername = owner.member.profile!.username;
            if (c.members.find((m) => m.user_id === userId)) {
                isMember = true;
            }

            if (owner.user_id === userId) {
                isOwner = true;
                isMember = true;
            }
        }

        return {
            name: c.name,
            channel_id: c.channel_id,
            type: c.type,
            collaboration_id: c.collaboration_id,
            updated_at: c.updated_at,
            member_count: c.members.length,
            online_member_count: onlineMembers.length,
            owner_username: ownerUsername,
            isOwner: isOwner,
            isMember: isMember
        };
    });

    return returnVal;
};

export const getChannelById = async (id: string): Promise<ICompleteChannelData | null> => {
    const channel = await db.channel.findUnique({
        where: { channel_id: id },
        select: {
            name: true,
            created_at: true,
            type: true,
            collaboration_id: true,
            updated_at: true,
            channel_id: true,
            members: {
                select: {
                    messages: {
                        select: {
                            message_data: true,
                            created_at: true
                        }
                    },
                    type: true,
                    member: {
                        select: {
                            profile: {
                                select: {
                                    username: true,
                                    avatar_url: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return channel;
};

export const createChannel = async (
    name: string,
    user_id: string
): Promise<{ channel: string; username: string } | null> => {
    const channel = await db.channel.create({
        data: {
            name: name
        },
        select: {
            name: true,
            channel_id: true
        }
    });

    if (!channel) {
        throw new create.InternalServerError('Could not create channel.');
    }

    const member = await db.channelMember
        .create({
            data: {
                channel_id: channel.channel_id,
                user_id: user_id,
                type: 'Owner'
            }
        })
        .member()
        .profile({ select: { username: true } });

    if (!member) {
        throw new create.InternalServerError('Could not create member in the channel');
    }

    return { channel: channel.name, username: member.username };
};

export const joinChannel = async (
    payload: IChannelIOPayload
): Promise<{ username: string } | null> => {
    const foundMember = await db.channelMember.findFirst({
        where: {
            user_id: payload.userId,
            channel_id: payload.channelId
        },
        select: {
            type: true,
            member: {
                select: {
                    profile: true
                }
            }
        }
    });

    if (foundMember) return { username: foundMember.member.profile!.username };

    const member = await db.channelMember
        .create({
            data: {
                channel_id: payload.channelId,
                user_id: payload.userId,
                type: 'Regular'
            }
        })
        .member()
        .profile({
            select: {
                username: true
            }
        });
    return member;
};

export const leaveChannel = async (
    payload: IChannelIOPayload
): Promise<{ username: string } | null> => {
    const foundMember = await db.channelMember.findFirst({
        where: {
            user_id: payload.userId,
            channel_id: payload.channelId
        }
    });

    if (!foundMember)
        throw new create.InternalServerError('Could not find member in list of members.');

    const member = await db.channelMember
        .delete({
            where: {
                member_id: foundMember.member_id
            }
        })
        .member()
        .profile();

    return member;
};

export const addUserMessage = async (
    payload: ISendMessagePayload
): Promise<IReceiveMessagePayload> => {
    const channelMember = await db.channelMember.findFirst({
        where: { channel_id: payload.channel_id, user_id: payload.user_id },
        select: {
            member_id: true,
            member: {
                select: {
                    profile: true
                }
            }
        }
    });

    if (!channelMember)
        throw new InternalServerError('The user could not be found as a member of this channel');

    const message = await db.message.create({
        data: {
            message_data: payload.message,
            member_id: channelMember.member_id,
        }
    });

    return {
        username: channelMember.member.profile!.username,
        avatar_url: channelMember.member.profile!.avatar_url,
        sender_profile_id: channelMember.member.profile!.profile_id,
        message_data: message.message_data,
        message_id: message.member_id,
        timestamp: moment(message.created_at).format('HH:mm:ss')
    } as IReceiveMessagePayload;
};

export const getChannelMessagesById = async (id: string): Promise<MessageReturn[] | null> => {
    const messages = await db.message.findMany({
        include: {
            sender: {
                select: {
                    member: {
                        select: {
                            profile: {
                                select: {
                                    username: true,
                                    avatar_url: true,
                                    user_id: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            sender: {
                channel_id: id,
            },
        },
        orderBy: {
            created_at: "asc",
        }
    });

    return messages;
};

// TODO: Tidy this up:

export type MessageReturn = {
    message_id: string;
    member_id: string;
    message_data: string;
    created_at: Date;
    sender: {
        member: {
            profile: {
                username: string;
                user_id: string;
                avatar_url: string;
            } | null;
        };
    };
};