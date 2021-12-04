import { Socket, Server } from 'socket.io';
import create from 'http-errors';
import { CollaborationType, MemberType } from '.prisma/client';
import validator from 'validator';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from '../../../utils/errors';
import { triggerJoin } from '../../../utils/collaborations';

export const handleJoin = async (io: Server, socket: Socket, payload: {
    userId: string,
    collaborationId: string,
    type: string,
    password?: string,
}): Promise<any> => {
    try {
        const userId = socket.data.user
        const { collaborationId, type, password } = payload;

        if (type === CollaborationType.Protected && !password) {
            throw new create.Unauthorized("Provided type is protected but no password has been provided");
        }

        const collaboration = await db.collaboration.findFirst({
            where: {
                collaboration_id: collaborationId
            },
            include: {
                collaboration_members: true
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
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                collaboration: {
                    include: {
                        channel: true,
                        drawing: true,
                        actions: {
                            where: {
                                collaborationId: collaborationId,
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

            const [member, channelMember] = await db.$transaction([
                db.collaborationMember.create({
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
                                channel: true,
                                drawing: true,
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
                }),
                db.channelMember.create({
                    data: {
                        channel_id: collaboration.channel_id,
                        type: MemberType.Regular,
                        user_id: userId
                    }
                })
            ]);

            if (!member) {
                throw new create.InternalServerError("Could not create member relationship between user and collaboration/drawing.");
            }

            triggerJoin(socket, member);

            io.to(member.collaboration.channel_id).emit('channel:joined', {
                collaborationId: member.collaboration_id,
                channelId: member.collaboration.channel_id,
                channelName: member.collaboration.channel.name
            });

            io.to(member.collaboration_id).emit("collaboration:joined", {
                userId: userId,
                collaborationId: member.collaboration_id,
                username: member.user.profile!.username,
                avatarUrl: member.user.profile!.avatar_url,
                drawingId: member.collaboration.drawing!.drawing_id,
                status: socket.data.status,
                roomId: member.collaboration_id
            });

        } else {
            triggerJoin(socket, member);
            io.to(member.collaboration_id).emit("collaboration:connected", {
                userId: member.user.user_id,
                username: member.user.profile!.username,
                avatarUrl: member.user.profile!.avatar_url,
                type: member.type,
                drawingId: member.collaboration.drawing!.drawing_id,
                roomId: member.collaboration_id,
                status: socket.data.status
            });

            io.to(member.collaboration.channel_id).emit('channel:joined', {
                collaborationId: member.collaboration_id,
                channelId: member.collaboration.channel_id,
                channelName: member.collaboration.channel.name
            });
        }

    } catch (e) {
        return handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}