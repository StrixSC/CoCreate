import { db } from '../db';
import validator from 'validator';
import assert from 'assert';
import { ChannelMember, MemberType } from '.prisma/client';

export const joinChannel = async (ctx: Context<{ channelId: string }>) => {
    const { channelId } = ctx.data;
    assert(channelId, new SocketEventError('Channel ID cannot be empty', 'E1001'));
    assert(
        validator.isAscii(channelId),
        new SocketEventError('Channel ID must only contain valid ASCII symbols.', 'E1002')
    );

    const channel = await db.channel.findUnique({
        where: {
            channel_id: channelId
        },
        include: {
            members: true
        }
    });

    if (!channel)
        throw new SocketEventError('Channel could not be found in the list of channels', 'E1003');

    const userIsAlreadyAMember = channel.members.findIndex(
        (c: ChannelMember) => c.user_id === ctx.socket.user
    );

    assert(
        userIsAlreadyAMember === -1,
        new SocketEventError(
            'Cannot add user as a member of this channel: User ia already a member of this channel.',
            'E1004'
        )
    );

    const createdMember = await db.channelMember.create({
        data: {
            channel_id: channel.channel_id,
            type: MemberType.Regular,
            user_id: ctx.socket.user
        }
    });

    if (!createdMember) throw new SocketEventError();

    ctx.socket.join(channel.channel_id.toString());

    return {
        channel_id: channel.channel_id,
        name: channel.name
    };
};
