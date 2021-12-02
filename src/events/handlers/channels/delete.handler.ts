import { MemberType } from "@prisma/client";
import { db } from "../../../db";
import { SocketEventError } from "../../../socket";
import { Server, Socket } from 'socket.io'
import { validateChannelId } from "../../../utils/channels";
import { handleSocketError } from "../../../utils/errors";
import { ExceptionType } from "../../../models/Exceptions.enum";

export const handleDelete = async (io: Server, socket: Socket, data: { channelId: string }) => {
    try {
        const { channelId } = data;
        validateChannelId(channelId);

        const member = await db.channelMember.findFirst({
            where: {
                channel_id: channelId,
                user_id: socket.data.user
            },
            include: {
                channel: true,
                member: true
            }
        });

        if (!member) {
            throw new SocketEventError(
                'Could not delete channel: Channel could not be found or member is not a part of this channel.',
                'E1015'
            );
        }

        if (member.type !== MemberType.Owner) {
            throw new SocketEventError(
                'Could not delete channel: User is not the owner of this channel',
                'E1016'
            );
        }

        const channel = await db.channel.delete({
            where: {
                channel_id: channelId
            }
        });

        if (!channel) {
            throw new SocketEventError(
                'Could not delete channel: Internal Socket Server Error',
                'E1017'
            );
        }

        io.to(channelId).emit('channel:deleted', {
            channelId: channel.channel_id
        });

        io.in(channelId).socketsLeave(channelId);
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Delete, ExceptionType.Channels]);
    }
};
