import { EventFinishedType } from './../../../models/Exceptions.enum';
import { MemberType } from "@prisma/client";
import { io } from "../../../bin/www";
import { Socket, Server } from 'socket.io';
import { db } from "../../../db";
import { SocketEventError } from "../../../socket";
import { validateChannelId } from "../../../utils/channels";
import { handleSocketError } from "../../../utils/errors";
import { ExceptionType } from "../../../models/Exceptions.enum";

export const handleLeave = async (io: Server, socket: Socket, data: { channelId: string }) => {
    try {
        const { channelId } = data;

        if (channelId === 'PUBLIC') {
            throw new SocketEventError('Oups! Vous ne pouvez pas quitter la chaîne publique... Désolé! :(', "E1529");
        }
        validateChannelId(channelId);

        const channelMember = await db.channelMember.findFirst({
            where: {
                user_id: socket.data.user,
                channel_id: channelId
            },
            include: {
                channel: true,
                member: true
            }
        });

        if (!channelMember) {
            throw new SocketEventError(
                'Hmm... On dirait que vous ne faites pas partie de cette chaîne...',
                'E1009'
            );
        }

        if (channelMember.type === MemberType.Owner) {
            throw new SocketEventError(
                'Hmm... On dirait que vous êtes le propriétaire de la chaîne, il faudrait plutôt la supprimer plutôt qu\'essayer de la quitter!',
                'E1010'
            );
        }

        const leftMember = await db.channelMember.delete({
            where: {
                member_id: channelMember.member_id
            },
            include: {
                channel: true
            }
        });

        if (!leftMember) {
            throw new SocketEventError(`Oups! Quelque chose s'est produit lors du traitement de la requête...`, 'E1060');
        }

        socket.emit(EventFinishedType.Channel_Leave);
        io.to(channelId).emit('channel:left', {
            channelType: leftMember.channel.type,
            channelId: channelId,
        });
        socket.leave(channelId);

    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Leave, ExceptionType.Channels]);
    }
};