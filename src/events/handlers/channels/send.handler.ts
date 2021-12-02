import moment from "moment";
import { Socket, Server } from 'socket.io';
import { db } from "../../../db";
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { validateChannelId, validateMessage } from "../../../utils/channels";
import { handleSocketError } from "../../../utils/errors";

export const handleSend = async (io: Server, socket: Socket, data: { message: string; channelId: string }) => {
    try {
        const { message, channelId } = data;

        validateChannelId(channelId);
        validateMessage(message);

        const channel = await db.channel.findUnique({
            where: {
                channel_id: channelId
            },
            include: {
                members: {
                    include: {
                        messages: true,
                        member: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        });

        if (!channel) {
            throw new SocketEventError(
                'Hmm... On dirait que la chaîne sélectionnée ne fait pas partie des chaînes disponible...',
                'E1019'
            );
        }

        const userIndex = channel.members.findIndex((m) => m.user_id === socket.data.user);

        const user = channel.members.find((u) => u.user_id === socket.data.user);
        if (!user) {
            throw new SocketEventError(
                'Oups, on dirait que vous ne faites pas partie de cette chaîne, il faudrait plutôt la rejoindre avant de pouvoir envoyer des messages!',
                'E1020'
            );
        }

        const dbMessage = await db.message.create({
            data: {
                message_data: message,
                member_id: channel.members[userIndex].member_id
            }
        });

        if (!dbMessage) {
            throw new SocketEventError(
                'Oups! Nous avons eu une erreur interne lors du traitement de la requête...',
                'E1021'
            );
        }

        io.to(channel.channel_id).emit('channel:sent', {
            message: message,
            messageId: dbMessage.message_id,
            channelId: channel.channel_id,
            username: channel.members[userIndex].member.profile?.username,
            avatarUrl: channel.members[userIndex].member.profile?.avatar_url,
            createdAt: moment(dbMessage.created_at).format('HH:mm:ss')
        });
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channel_Send, ExceptionType.Channels]);
    }
};