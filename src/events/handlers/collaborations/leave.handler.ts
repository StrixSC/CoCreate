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
        const { userId, collaborationId } = payload;

        if (!userId || userId !== socket.data.user) {
            throw new SocketEventError("Hmm... On dirait que vous n'avez pas le droit de faire cela...", "E1050");
        }

        if (!collaborationId) {
            throw new SocketEventError("Oups! On dirait qu'il n'y a pas eu d'identificateur de dessin envoyé...", "E1051");
        }

        const collaboration = await db.collaborationMember.findFirst({
            where: {
                collaboration_id: collaborationId,
                user_id: userId,
                collaboration: {
                    type: {
                        not: CollaborationType.Private
                    }
                }
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

        const updated = await db.collaborationMember.delete({
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
        });

        if (!updated) {
            throw new create.InternalServerError("Could not remove the user from the collaboration")
        }

        socket.to(collaboration.collaboration_id).emit("collaboration:left", {
            userId: updated.user_id,
            avatarUrl: updated.user.profile!.avatar_url,
            username: updated.user.profile!.username,
            collaborationId: updated.collaboration_id,
            leftAt: new Date().toISOString(),
            drawingId: collaboration.collaboration.drawing!.drawing_id,
        });

        socket.emit('collaboration:channel:leave');
        socket.leave(collaboration.collaboration_id);
        socket.leave(collaboration.collaboration.channel_id);

    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}