import { MemberType } from '.prisma/client';
import { Server, Socket } from 'socket.io';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { SocketEventError } from '../../../socket';
import { validateChannelId, validateChannelName } from '../../../utils/channels';
import { handleSocketError } from '../../../utils/errors';

export const handleUpdate = async (io: Server, socket: Socket, data: { channelId: string; channelName: string }) => {
    try {
        const { channelId, channelName } = data;
        validateChannelId(channelId);
        validateChannelName(channelName);

        const channelMember = await db.channelMember.findFirst({
            where: {
                channel_id: channelId,
                user_id: socket.data.user
            },
            include: {
                channel: true,
                member: true
            }
        });

        if (!channelMember) {
            throw new SocketEventError(
                'Could not update channel: User is not a member of this channel',
                'E42384'
            );
        }

        if (channelMember.type !== MemberType.Owner) {
            throw new SocketEventError(
                'Could not update channel: User is not the owner this channel',
                'E1011'
            );
        }

        const channelAlreadyExists = await db.channel.findFirst({
            where: {
                name: channelName
            }
        });

        if (channelAlreadyExists) {
            throw new SocketEventError(
                'Could not update channel: Channel name is already taken.',
                'E1012'
            );
        }

        const channel = await db.channel.update({
            where: {
                channel_id: channelId
            },
            data: {
                name: channelName,
                updated_at: new Date()
            }
        });

        if (!channel) {
            throw new SocketEventError(
                'Could not update channel: Internal Socket Server Error',
                'E1013'
            );
        }

        io.to(channelId).emit('channel:updated', {
            channelId: channel.channel_id,
            channelName: channel.name,
            updatedAt: channel.updated_at
        });
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Update, ExceptionType.Channels]);
    }
};