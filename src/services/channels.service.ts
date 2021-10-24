import create from 'http-errors';
import { IChannelIOPayload } from './../models/IJoinChannelPayload.model';
import { Channel, ChannelMember } from '.prisma/client';
import { db } from '../db';

export const getAllChannels = (): Promise<Channel[]> => {
    return Promise.resolve([]);
};

export const getChannelById = (): Promise<Channel> => {
    return Promise.resolve({} as Channel);
};

export const createChannel = async (
    name: string,
    user_id: string
): Promise<{
    channel: Channel;
    member: ChannelMember & { member: { profile: { username: string } | null } };
} | null> => {
    const channel = await db.channel.create({
        data: {
            name: name
        }
    });

    const member = await db.channelMember.create({
        data: {
            channel_id: channel.channel_id,
            user_id: user_id,
            type: 'Owner'
        },
        include: {
            member: {
                select: {
                    profile: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    });

    return {
        channel,
        member
    };
};

export const joinChannel = async (
    payload: IChannelIOPayload
): Promise<ChannelMember & { member: { profile: { username: string } | null } }> => {
    const member = await db.channelMember.create({
        data: {
            channel_id: payload.channelId,
            user_id: payload.userId,
            type: 'Regular'
        },
        include: {
            member: {
                select: {
                    profile: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    });

    return member;
};

export const leaveChannel = async (
    payload: IChannelIOPayload
): Promise<ChannelMember & { member: { profile: { username: string } | null } }> => {
    const memberAggregate = await db.channelMember.findFirst({
        where: {
            user_id: payload.userId,
            channel_id: payload.channelId
        }
    });

    if (!memberAggregate) {
        throw new create.InternalServerError('Could not find member in list of members.');
    }

    const member = await db.channelMember.delete({
        where: {
            member_id: memberAggregate.member_id
        },
        include: {
            member: {
                select: {
                    profile: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    });

    return member;
};
