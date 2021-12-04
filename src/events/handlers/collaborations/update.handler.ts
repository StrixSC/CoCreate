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
            throw new create.BadRequest("Invalid or missing type or title.");
        }

        const isValid = (
            !validator.isEmpty(title) &&
            validator.isLength(title, { min: 8, max: 256 }) &&
            validator.isIn(type, [CollaborationType.Private, CollaborationType.Protected, CollaborationType.Public])
        );

        if (!isValid) {
            throw new create.BadRequest("Title must be a non-empty alphanumeric value with a length between 8 and 256. The type must be either Public, Protected or Private");
        }

        if (type === CollaborationType.Protected) {
            if (!password ||
                validator.isEmpty(password) ||
                !validator.isAlphanumeric(password) ||
                !validator.isLength(password, { max: 256, min: 4 })
            ) {
                throw new create.BadRequest("The drawing is of type protected, but an empty or invalid password was provided");
            }
        }

        const collaboration = await db.collaboration.findUnique({
            where: {
                collaboration_id: collaborationId
            }
        });

        if (!collaboration) {
            throw new create.NotFound("There are no collaborations/drawings with this id.");
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
            throw new create.InternalServerError("Could not update the drawing/collaboration: Internal Server Error");
        }

        const author = updated.collaboration_members.find((m) => m.type === MemberType.Owner);

        if (!author) {
            throw new create.InternalServerError('Error while establishing author');
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

        io.to(response.collaborationId).emit("collaboration:updated", response);
        io.to(updated.channel.channel_id).emit("channel:updated", {
            channelId: updated.channel.channel_id,
            channelName: updated.channel.name,
            updatedAt: updated.channel.updated_at
        });
        io.emit("collaboration:updated", response);

    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}