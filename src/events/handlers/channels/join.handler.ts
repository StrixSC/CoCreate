import { EventFinishedType } from './../../../models/Exceptions.enum';
import { ChannelMember, MemberType } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { db } from "../../../db";
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { validateChannelId } from "../../../utils/channels";
import { handleSocketError } from "../../../utils/errors";

export const handleJoin = async (io: Server, socket: Socket, data: { channelId: string }) => {
    try {
        const { channelId } = data;
        validateChannelId(channelId);
        const channel = await db.channel.findUnique({
            where: {
                channel_id: channelId
            },
            include: {
                members: true
            }
        });

        if (!channel)
            throw new SocketEventError(
                `Hmm... On dirait que nous n'avons pas pu trouver la chaîne dans nos données... Si c'est une erreur, contactez un administrateur...`,
                'E1003'
            );

        const user = channel.members.find((c) => c.user_id === socket.data.user);

        if (!user) {
            const createdMember = await db.channelMember.create({
                data: {
                    channel_id: channel.channel_id,
                    type: MemberType.Regular,
                    user_id: socket.data.user
                }
            });

            if (!createdMember)
                throw new SocketEventError(
                    'Oups! Nous avons eu une erreur interne lors du traitement de votre requête',
                    'E1005'
                );

            socket.emit(EventFinishedType.Channel_Join);
            io.to(channelId).emit('channel:joined', {
                channelId: channel.channel_id,
                channelName: channel.name,
                channelType: channel.type,
                collaborationId: channel.collaboration_id
            });
        } else {
            socket.join(channelId);
            io.to(channelId).emit('channel:connected', {
                channelId: channelId,
                channelType: channel.type,
                channelName: channel.name,
                collaborationId: channel.collaboration_id
            })
        }

    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Join, ExceptionType.Channels]);
    }
};