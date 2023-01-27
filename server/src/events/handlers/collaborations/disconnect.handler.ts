import { UserStatusTypes, IConnectionEventData } from './../../../models/IUser.model';
import { SocketEventError } from './../../../socket';
import { Server, Socket } from 'socket.io';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from '../../../utils/errors';
import { computeUserUpdatedStats } from '../../../utils/collaborations';

export const handleDisconnect = async (io: Server, socket: Socket, payload: {
    collaborationId: string;
}) => {
    try {
        const member = await db.collaborationMember.findFirst({
            where: {
                user_id: socket.data.user,
                collaboration_id: payload.collaborationId
            },
            include: {
                user: {
                    include: {
                        profile: true,
                        stats: true,
                    },
                },
                collaboration: {
                    include: {
                        drawing: true,
                        channel: true
                    }
                }
            }
        });

        if (!member) {
            throw new SocketEventError("Oups! La déconnexion ne peut être faite, car l'utilisateur ne fait pas partie de la collaboration.", 'E8801');
        }

        const { time, collabs } = computeUserUpdatedStats(socket, member.user.stats!);
        const [updatedStats, deletedChannelMember] = await db.$transaction([
            db.stats.update({
                where: {
                    user_id: member.user_id
                },
                data: {
                    total_collaboration_sessions: collabs,
                    total_collaboration_time: time
                }
            }),
            db.channelMember.deleteMany({
                where: {
                    channel_id: member.collaboration.channel_id,
                    user_id: member.user_id
                },
            }),
        ]);

        if (!updatedStats || !deletedChannelMember) {
            throw new SocketEventError("Oups! Quelque chose s'est produit lors du traitement de la requête...", "E4423")
        }

        socket.data.status = UserStatusTypes.Online;
        const disconnectionData = {
            userId: member.user_id,
            avatarUrl: member.user.profile!.avatar_url,
            username: member.user.profile!.username,
            roomId: member.collaboration.channel_id,
            status: socket.data.status,
        }

        io.emit('status-change', {
            userId: socket.data.user,
            username: socket.data.username,
            avatarUrl: socket.data.avatarUrl,
            status: socket.data.status,
            roomId: member.collaboration.collaboration_id,
        } as IConnectionEventData);

        io.to(payload.collaborationId).emit("collaboration:disconnnected", disconnectionData);
        io.to(member.collaboration.channel_id).emit('channel:left', {
            channelId: member.collaboration.channel_id,
            channelType: member.collaboration.channel.type,
        });

        socket.leave(payload.collaborationId);
        socket.leave(member.collaboration.channel_id);
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Collaboration, ExceptionType.Collaboration_Disconnect])
    }
}