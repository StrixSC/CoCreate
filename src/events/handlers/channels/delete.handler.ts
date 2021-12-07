import { EventFinishedType } from './../../../models/Exceptions.enum';
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
                `Hmm... On dirait que vous n'êtes pas membre de la chaîne...`,
                'E1015'
            );
        }

        if (member.type !== MemberType.Owner) {
            throw new SocketEventError(
                "Oups! Il semblerait que vous n'êtes pas le propriétaire de la chaîne...",
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
                'Oups! Erreur imprévue lors du traitement de la requête...',
                'E1017'
            );
        }

        socket.emit(EventFinishedType.Channel_Delete);
        io.to(channelId).emit('channel:deleted', {
            channelId: channel.channel_id
        });

        io.in(channelId).socketsLeave(channelId);
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Delete, ExceptionType.Channels]);
    }
};
