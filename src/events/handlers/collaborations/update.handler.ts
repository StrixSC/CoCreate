import { SocketEventError } from './../../../socket';
import { EventFinishedType } from './../../../models/Exceptions.enum';
import { CollaborationType, MemberType } from '.prisma/client';
import create from 'http-errors';
import { Server, Socket } from 'socket.io';
import validator from 'validator';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from '../../../utils/errors';

export const handleUpdate = async (io: Server, socket: Socket, payload: {
    userId: string,
    collaborationId: string,
    title?: string,
    type?: CollaborationType,
    password?: string,
}): Promise<void> => {
    try {
        const userId = socket.data.user
        const { title, type, password, collaborationId } = payload;

        if (!type || !title) {
            throw new SocketEventError("Hmm... on dirait que vous avez essayer de mettre à jour un dessin sans avoir envoye de nouvelles informations...", "E4273");
        }

        const isValid = (
            !validator.isEmpty(title) &&
            validator.isLength(title, { min: 8, max: 256 }) &&
            validator.isIn(type, [CollaborationType.Private, CollaborationType.Protected, CollaborationType.Public])
        );

        if (!isValid) {
            throw new SocketEventError("ERREUR: Le titre doit être entre 8 et 256 caractères, le type doit être soit Privé, protégé ou public...", "E4214");
        }

        if (type === CollaborationType.Protected) {
            if (!password ||
                validator.isEmpty(password) ||
                !validator.isLength(password, { max: 256, min: 8 })
            ) {
                throw new SocketEventError("Hmm... On dirait que vous avez essayer de changer la visibilité du dessin à protégé, mais vous n'avez pas fournit un mot de passe valide...", "E8189");
            }
        }

        const collaboration = await db.collaboration.findUnique({
            where: {
                collaboration_id: collaborationId
            }
        });

        if (!collaboration) {
            throw new SocketEventError("Oups! On dirait que vous n'avez pas mentionné quel dessin vous souhaitez mettre à jour...", "E1923")
        }

        const updated = await db.collaboration.update({
            where: {
                collaboration_id: collaborationId
            },
            data: {
                drawing: {
                    update: {
                        title: title
                    }
                },
                channel: {
                    update: {
                        name: title,
                    }
                },
                type: type,
                password: type === CollaborationType.Protected ? password : undefined
            },
            include: {
                channel: true,
                drawing: true,
                collaboration_members: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            },
        });

        if (!updated) {
            throw new SocketEventError('Oops! Une erreur inconnue s\'est produite lors du traitement de la requête, veuillez essayez à nouveau SVP!', 'E49533');
        }

        const author = updated.collaboration_members.find((m) => m.type === MemberType.Owner);

        if (!author) {
            throw new SocketEventError('Oops! Une erreur inconnue s\'est produite lors du traitement de la requête, veuillez essayez à nouveau SVP!', 'E49534');
        }

        const response = {
            collaborationId: updated.collaboration_id,
            title: updated.drawing!.title,
            thumbnailUrl: updated.drawing!.thumbnail_url,
            type: updated.type,
            currentCollaboratorCount: updated.collaboration_members.length,
            updatedAt: updated.updated_at,
            drawingId: updated.drawing!.drawing_id,
            createdAt: updated.created_at,
            authorUsername: author.user.profile!.username,
            authorAvatarUrl: author.user.profile!.avatar_url,
        }

        socket.emit(EventFinishedType.Collaboration_Update);
        io.to(response.collaborationId).emit("collaboration:updated", response);
        io.to(updated.channel.channel_id).emit("channel:updated", {
            channelId: updated.channel.channel_id,
            channelName: updated.channel.name,
            updatedAt: updated.channel.updated_at
        });
        io.emit("collaboration:updated", response);

    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Collaboration, ExceptionType.Collaboration_Update]);
    }
}