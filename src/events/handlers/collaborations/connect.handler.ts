import { IConnectionEventData } from './../../../models/IUser.model';
import create from 'http-errors';
import { Server, Socket } from 'socket.io';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { SocketEventError } from '../../../socket';
import { triggerJoin } from '../../../utils/collaborations';
import { handleSocketError } from '../../../utils/errors';

export const handleConnect = async (io: Server, socket: Socket, payload: {
    userId: string,
    collaborationId: string,
}): Promise<void> => {
    try {
        const userId = socket.data.user;
        const collaborationId = payload.collaborationId;

        if (!collaborationId) {
            throw new create.BadRequest("Missing or invalid collaborationId or userId");
        }

        const member = await db.collaborationMember.findFirst({
            where: {
                collaboration_id: collaborationId,
                user_id: userId
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                collaboration: {
                    include: {
                        author: {
                            include: {
                                user: {
                                    include: {
                                        profile: true,
                                    }
                                },
                                team: true,
                            }
                        },
                        drawing: true,
                        channel: true,
                        actions: {
                            where: {
                                collaborationId: collaborationId
                            },
                            orderBy: {
                                createdAt: "asc"
                            }
                        },
                        collaboration_members: {
                            include: {
                                user: {
                                    include: {
                                        profile: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!member) {
            throw new create.Unauthorized("The user is not a member of the collaboration, or the collaboration does not exist. Try joining the collaboration first before connecting.");
        }

        const channelMember = await db.channelMember.create({
            data: {
                user_id: userId,
                channel_id: member.collaboration.channel_id,
                type: member.type
            }
        })

        if (!channelMember) {
            throw new SocketEventError("Oups... On dirait qu'il y a eu une erreur lors du traitement de la requête...", "E4452");
        }

        triggerJoin(socket, member);

        io.emit('status-change', {
            userId: socket.data.user,
            username: socket.data.username,
            avatarUrl: socket.data.avatarUrl,
            status: socket.data.status,
            roomId: collaborationId,
        } as IConnectionEventData);

        io.to(member.collaboration.channel_id).emit("channel:joined", {
            userId: socket.data.user,
            username: socket.data.username,
            status: socket.data.status,
            roomId: member.collaboration.channel_id,
            channelId: member.collaboration.channel_id,
            channelName: member.collaboration.channel.name,
            avatarUrl: socket.data.avatarUrl,
            collaborationId: member.collaboration.collaboration_id
        } as IConnectionEventData);

        io.to(member.collaboration_id).emit("collaboration:connected", {
            userId: member.user.user_id,
            username: member.user.profile!.username,
            avatarUrl: member.user.profile!.avatar_url,
            type: member.type,
            drawingId: member.collaboration.drawing!.drawing_id,
        });

        socket.emit("channel:created", {
            collaborationId: member.collaboration.collaboration_id,
            channelId: member.collaboration.channel_id,
            channelName: member.collaboration.channel.name,
            ownerUsername:
                member.collaboration.author.is_team
                    ? member.collaboration.author.team!.team_name
                    : member.collaboration.author.user!.profile!.username,
            createdAt: member.collaboration.channel_id,
            updatedAt: member.collaboration.channel.updated_at
        });

    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }

}