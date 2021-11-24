import { ExceptionType } from './../models/Exceptions.enum';
import create, { Unauthorized } from 'http-errors';
import { handleSocketError } from './../utils/errors';
import { db } from './../db';
import { Server, Socket } from 'socket.io';
import { Action, Collaboration, CollaborationMember, CollaborationType, Drawing, MemberType, Profile, User } from '.prisma/client';
import validator from "validator";
import { io } from '../bin/www';

type CollaborationMemberConnectionResponse = CollaborationMember & {
    user: User & {
        profile: Profile | null;
    };
    collaboration: Collaboration & {
        drawing: Drawing | null;
        actions: Action[];
        collaboration_members: (CollaborationMember & {
            user: User & {
                profile?: Profile | null
            }
        })[];
    };
}

export = (io: Server, socket: Socket) => {
    const onJoinCollaboration = async (payload: {
        userId: string,
        collaborationId: string,
        type: string,
        password?: string,
    }): Promise<any> => {
        try {
            const { userId, collaborationId, type, password } = payload;

            if (userId !== socket.data.user) {
                throw new create.Unauthorized("Provided user Id does not match the session user id.");
            }

            if (type === CollaborationType.Protected && !password) {
                throw new create.Unauthorized("Provided type is protected but no password has been provided");
            }

            const collaboration = await db.collaboration.findFirst({
                where: {
                    collaboration_id: collaborationId
                }
            });

            if (!collaboration) {
                throw new create.NotFound("There are no drawings with this drawing id/collaboration id.");
            }

            const member = await db.collaborationMember.findFirst({
                where: {
                    user: {
                        user_id: userId,
                    },
                    collaboration_id: collaboration.collaboration_id
                },
            });

            if (!member) {
                let correctPassword = false;
                const collaborationType = collaboration.type;
                if (collaborationType === CollaborationType.Private) {
                    throw new create.Unauthorized("This drawing is private and cannot be joined by a user that is not the owner.");
                }

                if (collaborationType === CollaborationType.Protected) {
                    if (password &&
                        !validator.isEmpty(password) &&
                        validator.isAlphanumeric(password) &&
                        validator.isLength(password, { max: 256, min: 4 })
                    ) {
                        if (collaboration.password && collaboration.password === password) {
                            correctPassword = true;
                        }
                    } else {
                        throw new create.BadRequest("The drawing is of type protected, but an empty or invalid password was provided");
                    }

                    if (!correctPassword) {
                        throw new create.Unauthorized("Invalid or incorrect password to drawing/collaboration.");
                    }
                }

                const member = await db.collaborationMember.create({
                    data: {
                        type: MemberType.Regular,
                        collaboration_id: collaboration.collaboration_id,
                        user_id: userId,
                    },
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        },
                        collaboration: {
                            include: {
                                drawing: true,
                                actions: {
                                    where: {
                                        collaborationId: collaborationId
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
                    throw new create.InternalServerError("Could not create member relationship between user and collaboration/drawing.");
                }

                // TODO: Might need to switch "socket" to "io"
                if (collaboration.type !== CollaborationType.Private) {
                    io.emit("collaboration:joined", {
                        userId: userId,
                        collaborationId: member.collaboration_id,
                        username: member.user.profile!.username,
                        avatarUrl: member.user.profile!.avatar_url,
                    });
                }

                socket.join(member.collaboration_id);

                socket.emit("collaboration:load", generateConnectedPayload);
            } else {
                throw new create.Unauthorized("This user is already a member of this collaboration.");
            }

        } catch (e) {
            return handleSocketError(socket, e, ExceptionType.Collaboration);
        }
    }

    const onCreateCollaboration = async (payload: {
        userId: string,
        title: string,
        type: CollaborationType,
        password?: string
    }): Promise<void> => {
        try {
            const { userId, title, type, password } = payload;

            console.log(payload);

            const isValid = (
                !validator.isEmpty(title) &&
                validator.isLength(title, { min: 8, max: 256 }) &&
                validator.isIn(type, [CollaborationType.Private, CollaborationType.Protected, CollaborationType.Public])
            );

            if (!isValid) {
                throw new create.BadRequest("Title must be a non-empty alphanumeric value with a length between 8 and 256. The type must be either Public, Protected or Private");
            }

            if (type === CollaborationType.Private) {
                const collaboration = await createCollaboration(userId, CollaborationType.Private, title);

                const author = collaboration.collaboration_members.find((m) => m.type === MemberType.Owner);

                if (!author) {
                    throw new create.InternalServerError('Error while establishing author');
                }

                socket.emit("collaboration:created", {
                    collaborationId: collaboration.collaboration_id,
                    title: collaboration.drawing!.title,
                    thumbnailUrl: collaboration.drawing!.thumbnail_url,
                    type: collaboration.type,
                    currentCollaboratorCount: collaboration.collaboration_members.length,
                    maxCollaboratorCount: collaboration.max_collaborator_count,
                    updatedAt: collaboration.updated_at,
                    drawingId: collaboration.drawing!.drawing_id,
                    createdAt: collaboration.created_at,
                    authorUsername: author.user.profile!.username,
                    authorAvatarUrl: author.user.profile!.avatar_url,
                });
            } else {
                if (
                    type === CollaborationType.Protected &&
                    (!password || (password && validator.isEmpty(password)))
                ) {
                    throw new create.BadRequest("Collaboration type protected was given but no password (or an empty password) was given with the request.");
                }
                const collaboration = await createCollaboration(userId, type, title, password);
                if (!collaboration) {
                    throw new create.InternalServerError("Could not create drawing/collaboration. Internal server error.");
                }

                const author = collaboration.collaboration_members.find((m) => m.type === MemberType.Owner);

                if (!author) {
                    throw new create.InternalServerError('Error while establishing author');
                }

                io.emit("collaboration:created", {
                    collaborationId: collaboration.collaboration_id,
                    title: collaboration.drawing!.title,
                    thumbnailUrl: collaboration.drawing!.thumbnail_url,
                    type: collaboration.type,
                    currentCollaboratorCount: collaboration.collaboration_members.length,
                    maxCollaboratorCount: collaboration.max_collaborator_count,
                    updatedAt: collaboration.updated_at,
                    drawingId: collaboration.drawing!.drawing_id,
                    createdAt: collaboration.created_at,
                    authorUsername: author.user.profile!.username,
                    authorAvatarUrl: author.user.profile!.avatar_url,
                });
            }
        } catch (e) {
            handleSocketError(socket, e, ExceptionType.Collaboration);
        }
    }

    const onDeleteCollaboration = async (payload: {
        userId: string,
        collaborationId: string,
    }): Promise<void> => {
        try {
            const { userId, collaborationId } = payload;

            if (!userId || userId !== socket.data.user) {
                throw new create.Unauthorized("UserId does not match session userId");
            }

            if (!collaborationId) {
                throw new create.BadRequest('Invalid or missing userId or collaborationId from payload.');
            }

            const member = await db.collaborationMember.findFirst({
                where: {
                    user_id: userId,
                    collaboration_id: collaborationId,
                    type: MemberType.Owner
                }
            });

            if (!member) {
                throw new create.Unauthorized('Failed to delete: either this user is not a member of this drawing, or is not the owner.')
            }

            const collaboration = await db.collaboration.delete({
                where: {
                    collaboration_id: collaborationId
                }
            });

            if (!collaboration) {
                throw new create.InternalServerError('Failed to delete: Internal server error.');
            }

            const response = {
                collaborationId: collaboration.collaboration_id,
                deletedAt: new Date().toISOString(),
            };

            if (collaboration.type === CollaborationType.Private) {
                socket.emit('collaboration:deleted', response)
            } else {
                io.emit('collaboration:deleted', response)
            }
        } catch (e) {
            handleSocketError(socket, e, ExceptionType.Collaboration);
        }
    }

    const onUpdateCollaboration = async (payload: {
        userId: string,
        collaborationId: string,
        title?: string,
        type?: CollaborationType,
        password?: string,
    }): Promise<void> => {
        try {
            const { userId, title, type, password, collaborationId } = payload;

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
                    type: type,
                    password: type === CollaborationType.Protected ? password : undefined
                },
                include: {
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
                maxCollaboratorCount: updated.max_collaborator_count,
                updatedAt: updated.updated_at,
                drawingId: updated.drawing!.drawing_id,
                createdAt: updated.created_at,
                authorUsername: author.user.profile!.username,
                authorAvatarUrl: author.user.profile!.avatar_url,
            }

            if (updated.type === CollaborationType.Private && type === CollaborationType.Private) {
                socket.emit("collaboration:updated", response);
            } else {
                io.emit('collaboration:updated', response);
            }

        } catch (e) {
            handleSocketError(socket, e, ExceptionType.Collaboration);
        }
    }

    const onConnectCollaboration = async (payload: {
        userId: string,
        collaborationId: string,
    }): Promise<void> => {
        try {
            const { userId, collaborationId } = payload;

            if (!userId || userId !== socket.data.user) {
                throw new create.Unauthorized("Invalid or missing userId/provided userId does not match the session user.");
            }

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
                            drawing: true,
                            actions: {
                                where: {
                                    collaborationId: collaborationId
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

            socket.broadcast.to(member.collaboration_id).emit("collaboration:connected", {
                userId: member.user.user_id,
                username: member.user.profile!.username,
                avatarUrl: member.user.profile!.avatar_url,
                type: member.type
            });

            socket.join(member.collaboration_id);

            socket.emit("collaboration:load", generateConnectedPayload(member))

        } catch (e) {
            handleSocketError(socket, e, ExceptionType.Collaboration);
        }

    }

    const onLeaveCollaboration = async (payload: {
        userId: string,
        collaborationId: string
    }) => {
        try {
            const { userId, collaborationId } = payload;

            if (!userId || userId !== socket.data.user) {
                throw new create.Unauthorized("Invalid or missing userId/provided userId does not match the session user.");
            }

            if (!collaborationId) {
                throw new create.BadRequest("Invalid or missing collaborationId in the provided payload");
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
            });
        } catch (e) {
            handleSocketError(socket, e, ExceptionType.Collaboration);
        }
    }

    socket.on("collaboration:join", onJoinCollaboration);
    socket.on("collaboration:create", onCreateCollaboration);
    socket.on("collaboration:update", onUpdateCollaboration);
    socket.on("collaboration:delete", onDeleteCollaboration);
    socket.on("collaboration:connect", onConnectCollaboration);
    socket.on("collaboration:leave", onLeaveCollaboration);
}

const generateConnectedPayload = (member: CollaborationMemberConnectionResponse) => {
    const allActiveSockets = io.sockets.adapter.rooms.get(member.collaboration_id);
    const onlineMembers = [] as string[];
    const allSockets = io.sockets.sockets;
    allActiveSockets!.forEach((s) => {
        for (let [socketId, socket] of allSockets) {
            if (socketId === s) {
                onlineMembers.push(socket.data.user);
            }
        }
    })

    return {
        actions: member.collaboration.actions,
        memberCount: member.collaboration.collaboration_members.length,
        maxMemberCount: member.collaboration.max_collaborator_count,
        title: member.collaboration.drawing!.title,
        authorUsername: member.collaboration.collaboration_members
            .find((c) => c.type === MemberType.Owner)!.user.profile!.username || "Admin",
        authorAvatar: member.collaboration.collaboration_members
            .find((c) => c.type === MemberType.Owner)!.user.profile?.avatar_url || "",
        members: member.collaboration.collaboration_members
            .filter((m) => m.type === MemberType.Regular)
            .map((m) => ({
                avatarUrl: m.user.profile!.avatar_url,
                username: m.user.profile!.username,
                isOnline: onlineMembers.includes(m.user_id) ? true : false
            })),
        backgroundColor: member.collaboration.drawing!.background_color,
        width: member.collaboration.drawing!.width,
        height: member.collaboration.drawing!.height,
    }
};

const createCollaboration = async (userId: string, type: CollaborationType, title: string, password?: string) => {
    return db.collaboration.create({
        data: {
            type: type,
            password: type === CollaborationType.Protected ? password : undefined,
            drawing: {
                create: {
                    title: title,
                }
            },
            collaboration_members: {
                create: [
                    {
                        type: MemberType.Owner,
                        user_id: userId,
                    }
                ]
            }
        },
        include: {
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
        }
    })
}