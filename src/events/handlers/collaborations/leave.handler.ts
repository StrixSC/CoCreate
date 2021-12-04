import { CollaborationType, MemberType } from '.prisma/client';
import create from 'http-errors';
import { Server, Socket } from 'socket.io';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { SocketEventError } from '../../../socket';
import { handleSocketError } from '../../../utils/errors';

export const handleLeave = async (io: Server, socket: Socket, payload: {
    userId: string,
    collaborationId: string
}) => {
    try {
        const userId = socket.data.user;
        const collaborationId = payload.collaborationId;

        if (!collaborationId) {
            throw new SocketEventError("Oups! On dirait qu'il n'y a pas eu d'identificateur de dessin envoyé...", "E1051");
        }

        const collaboration = await db.collaborationMember.findFirst({
            where: {
                collaboration_id: collaborationId,
                user_id: userId,
            },
            include: {
                collaboration: {
                    include: {
                        drawing: true,
                    }
                }
            }
        });

        if (!collaboration) {
            throw new create.Unauthorized("No members with this id could be found in this collaboration. If the drawing is private, it must be deleted instead of left.");
        }

        const [deletedCollabMember, deletedChannelMember] = await db.$transaction([
            db.collaborationMember.delete({
                where: {
                    collaboration_member_id: collaboration.collaboration_member_id,
                },
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            }),
            db.channelMember.deleteMany({
                where: {
                    channel_id: collaboration.collaboration.channel_id,
                    user_id: userId
                }
            })
        ]);

        if (!deletedChannelMember || !deletedCollabMember) {
            throw new create.InternalServerError("Could not remove the user from the collaboration")
        }

        socket.to(collaboration.collaboration_id).emit("collaboration:left", {
            userId: deletedCollabMember.user_id,
            avatarUrl: deletedCollabMember.user.profile!.avatar_url,
            username: deletedCollabMember.user.profile!.username,
            collaborationId: collaboration.collaboration_id,
            leftAt: new Date().toISOString(),
            drawingId: collaboration.collaboration.drawing!.drawing_id,
        });

        socket.emit('channel:left', {
            channelId: collaboration.collaboration.channel_id,
        });

        socket.leave(collaboration.collaboration_id);
        socket.leave(collaboration.collaboration.channel_id);

    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}