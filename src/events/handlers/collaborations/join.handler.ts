import { SocketEventError } from './../../../socket';
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
            throw new SocketEventError("Oups... On dirait que vous avec chosit de rejoindre un dessin protégé, mais vous n'avez pas fournit de mot de passe...", "E4293");
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
            throw new SocketEventError("Oups! Quelque chose d'imprévu s'est passé lors du traitement de votre requête... veuillez re-éssayer plus tard!");
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
                throw new SocketEventError("Oh non! Ce dessin est marqué comme étant privé. Il faut donc faire partie des membres de l'équipe ayant créé le dessin, ou bien en être le propriétaire... Désolé!", "E1823");
            }

            if (collaborationType === CollaborationType.Protected) {
                if (password &&
                    !validator.isEmpty(password) &&
                    validator.isLength(password, { max: 256, min: 8 })
                ) {
                    if (collaboration.password && collaboration.password === password) {
                        correctPassword = true;
                    }
                } else {
                    throw new SocketEventError("Le mot de passe que vous avez fournit n'est pas valide, il faut qu'il soit entre 8 et 256 caractères...", "E1502")
                }

                if (!correctPassword) {
                    throw new SocketEventError("On dirait que le mot de passe entré ne correspond pas au mot de passe associé au dessin...", "E4821");
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
                throw new SocketEventError("Oups! Une erreur imprévu s'est produit lors du traitement de la requête...", "E4271");
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