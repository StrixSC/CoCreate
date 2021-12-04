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

        const userId = socket.data.user;
        const collaborationId = payload.collaborationId;

        if (!collaborationId) {
            throw new SocketEventError("Hmm... On dirait que vous n'avez pas mentionné quel dessin vous voudriez supprimer.", "E5002", ExceptionType.Collaboration_Delete)
        }

        const member = await db.collaborationMember.findFirst({
            where: {
                user_id: userId,
                collaboration_id: collaborationId,
                OR: [
                    { type: MemberType.Owner },
                    {
                        AND: [
                            {
                                collaboration: {
                                    author: {
                                        is_team: true
                                    },
                                },
                            },
                            {
                                collaboration: {
                                    author: {
                                        team: {
                                            team_members: {
                                                some: {
                                                    user_id: userId
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            include: {
                collaboration: true,
            }
        });

        if (!member) {
            throw new SocketEventError(`Hmm... On dirait que vous n'êtes pas autorisé à supprimer ce dessin...`, "E4023")
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

        io.emit('collaboration:deleted', {
            collaborationId: deletedCollaboration.collaboration_id,
        });

        io.to(deletedChannel.channel_id).emit('channel:deleted', {
            channelId: deletedChannel.channel_id
        });

        io.socketsLeave(deletedCollaboration.collaboration_id);
        io.socketsLeave(deletedChannel.channel_id);
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}
