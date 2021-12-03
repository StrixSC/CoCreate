import { CollaborationType, MemberType } from '.prisma/client';
import { Server, Socket } from 'socket.io';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { SocketEventError } from '../../../socket';
import { handleSocketError } from '../../../utils/errors';

export const handleDelete = async (io: Server, socket: Socket, payload: {
    userId: string,
    collaborationId: string,
}): Promise<void> => {
    try {
        const { userId, collaborationId } = payload;

        if (!userId || userId !== socket.data.user) {
            throw new SocketEventError('Oops, on dirait que cet utilisateur n`est pas autorisé à faire cet action...', "E5001", ExceptionType.Collaboration_Delete)
        }

        if (!collaborationId) {
            throw new SocketEventError("Hmm... On dirait que vous n'avez pas mentionné quel dessin vous voudriez supprimer.", "E5002", ExceptionType.Collaboration_Delete)
        }

        const member = await db.collaborationMember.findFirst({
            where: {
                user_id: userId,
                collaboration_id: collaborationId,
                type: MemberType.Owner
            },
            include: {
                collaboration: true,
            }
        });

        if (!member) {
            throw new SocketEventError(`Hmm... On dirait que vous n'êtes pas le propriétaire du dessin...`, "E4023")
        }

        const [deletedCollaboration, deletedChannel] = await db.$transaction([
            db.collaboration.delete({
                where: {
                    collaboration_id: member.collaboration.collaboration_id
                }
            }),
            db.channel.delete({
                where: {
                    channel_id: member.collaboration.channel_id
                }
            })
        ])

        if (!deletedCollaboration || !deletedChannel) {
            throw new SocketEventError("Oups! On dirait qu'il y a eu une erreur lors de la suppression du dessin...", "E5003", ExceptionType.Collaboration_Delete)
        }

        const response = {
            collaborationId: deletedCollaboration.collaboration_id,
            deletedAt: new Date().toISOString(),
        };

        if (deletedCollaboration.type === CollaborationType.Private) {
            io.to(deletedCollaboration.collaboration_id).emit('collaboration:deleted', response);
        } else {
            io.emit('collaboration:deleted', response)
        }

        io.to(deletedChannel.channel_id).emit('collaboration:channel:leave');
        io.socketsLeave(deletedCollaboration.collaboration_id);
        io.socketsLeave(deletedChannel.channel_id);
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}
