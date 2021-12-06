import { validateChannelName } from './../../../utils/channels';
import { MemberType } from "@prisma/client";
import { db } from "../../../db";
import { Socket, Server } from "socket.io";
import { SocketEventError } from "../../../socket";
import { handleSocketError } from "../../../utils/errors";
import { ExceptionType } from '../../../models/Exceptions.enum';

export const handleCreate = async (io: Server, socket: Socket, data: { channelName: string }) => {
    try {
        const { channelName } = data;

        validateChannelName(channelName);

        const channelExists = await db.channel.findFirst({
            where: {
                name: data.channelName
            }
        });

        if (channelExists) {
            throw new SocketEventError('Oups, il semble que ce nom soit déjà pris. Veuillez choisir un autre nom !', 'E1040');
        }

        const channel = await db.channel.create({
            data: {
                name: channelName,
                members: {
                    create: [{ user_id: socket.data.user, type: 'Owner' }]
                }
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

        if (!channel)
            throw new SocketEventError(
                'Oups... On dirait qu\'il y a eu une erreur lors du traitement de la requête...',
                'E1008'
            );

        socket.join(channel.channel_id.toString());

        io.emit('channel:created', {
            channelId: channel.channel_id,
            channelName: channel.name,
            ownerUsername: channel.members.find((m) => m.type === MemberType.Owner)?.member.profile?.username || 'admin',
            createdAt: channel.created_at,
            channelType: channel.type,
            updatedAt: channel.updated_at,
            collaborationId: channel.collaboration_id || null
        });
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Channels, ExceptionType.Channel_Create]);
    }
};
