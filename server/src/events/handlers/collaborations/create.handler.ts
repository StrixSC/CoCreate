import { EventFinishedType } from './../../../models/Exceptions.enum';
import { SocketEventError } from './../../../socket';
import { Account, ChannelType, CollaborationType, MemberType, Profile, TeamMember, User } from '.prisma/client';
import create from 'http-errors';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';
import validator from 'validator';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from '../../../utils/errors';
import { findTeamById } from '../teams/join.handler';
import log from '../../../utils/logger';

export type ITeamMember = (TeamMember & {
    user: User & {
        profile: Profile | null;
        account: Account | null;
    };
})[];

export const handleCreate = async (io: Server, socket: Socket, payload: {
    userId: string,
    creatorId: string,
    isTeam: boolean,
    title: string,
    bgColor: string,
    type: CollaborationType,
    password?: string
}): Promise<void> => {
    try {
        const userId = socket.data.user
        const { creatorId, isTeam, title, type, bgColor, password } = payload;

        const isValid = (
            !validator.isEmpty(title) &&
            validator.isLength(title, { min: 8, max: 256 }) &&
            validator.isIn(type, [CollaborationType.Private, CollaborationType.Protected, CollaborationType.Public])
        );

        if (!isValid) {
            throw new SocketEventError("On dirait que certaines informations fournies ne sont pas valides. Le titre doit être entre 8 et 256 caractère. Le type doit être soit 'public', 'protégé' ou 'privé'.", "E1532");
        }

        let teamMembers = [] as ITeamMember;

        if (isTeam) {
            const team = await findTeamById(creatorId);
            if (!team) {
                throw new SocketEventError("Hmm... nous n'avons pas réussi à trouver une équipe avec les informations fournies... Si c'est une erreur, veuillez reporter ça à un administrateur.", "E1538")
            }

            const member = team.team_members.find((tm) => tm.user_id === userId);
            teamMembers = team.team_members;
            if (!member) {
                throw new SocketEventError("Vous n'êtes pas membre de l'équipe fournies. Si ceci est une erreur, veuillez contacter un administrateur.", "E4134")
            }
        }

        if (type === CollaborationType.Private) {
            const data = await createCollaboration(userId, creatorId, isTeam, type, title, teamMembers, bgColor, password);

            if (!data.collaboration) {
                throw new SocketEventError("Oups! Erreur lors du traitement de la requête...");
            }

            const response = {
                collaborationId: data.collaboration.collaboration_id,
                title: data.title,
                drawingId: data.drawingId,
                thumbnailUrl: data.thumbnail_url,
                type: data.collaboration.type,
                currentCollaboratorCount: data.currentMemberCount,
                updatedAt: data.collaboration.updated_at,
                createdAt: data.collaboration.created_at,
                authorUsername: data.author_username,
                authorAvatarUrl: data.author_avatar_url,
            }

            socket.emit(EventFinishedType.Collaboration_Create);
            if (isTeam) {
                io.to(creatorId).emit('collaboration:created', response);
            } else {
                socket.emit("collaboration:created", response);
            }
        } else {
            if (type === CollaborationType.Protected && !password) {
                throw new SocketEventError("Oups! On dirait que le type que vous avez donné est protégé, mais il n'y a aucun mot de passe d'entré...", "E4914");
            }

            const data = await createCollaboration(userId, creatorId, isTeam, type, title, teamMembers, bgColor, password);

            if (!data || !data.collaboration) {
                throw new SocketEventError("Quelque chose vient de se produire lors du traitement de la requête...", "E5203");
            }

            socket.emit(EventFinishedType.Collaboration_Create);
            io.emit("collaboration:created", {
                collaborationId: data.collaboration.collaboration_id,
                title: data.title,
                drawingId: data.drawingId,
                thumbnailUrl: data.thumbnail_url,
                type: data.collaboration.type,
                currentCollaboratorCount: data.currentMemberCount,
                updatedAt: data.collaboration.updated_at,
                createdAt: data.collaboration.created_at,
                authorUsername: data.author_username,
                authorAvatarUrl: data.author_avatar_url,
            });

        }
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Collaboration, ExceptionType.Collaboration_Create]);
    }
}

const createCollaboration = async (user_id: string, creatorId: string, isTeam: boolean, type: CollaborationType, title: string, teamMembers: any[], bgColor: string, password?: string) => {
    const collab_id = v4();

    const author = await db.author.create({
        data: {
            is_team: isTeam,
            user_id: isTeam ? undefined : creatorId,
            team_id: isTeam ? creatorId : undefined,
            collaborations: {
                create: [{
                    collaboration_id: collab_id,
                    type: type,
                    password: password,
                    drawing: {
                        create: {
                            background_color: bgColor,
                            title: title,
                        }
                    },
                    collaboration_members: {
                        create: isTeam
                            ? teamMembers.map((tm) => ({ type: tm.user_id === user_id ? MemberType.Owner : MemberType.Regular, user_id: tm.user_id })) :
                            [{ type: MemberType.Owner, user_id: user_id }]
                    },
                    channel: {
                        create: {
                            name: title,
                            type: ChannelType.Collaboration,
                        }
                    }
                }]
            }
        },
        include: {
            user: {
                include: {
                    profile: true,
                    account: true,
                }
            },
            team: true,
            collaborations: {
                where: {
                    collaboration_id: collab_id,
                },
                include: {
                    drawing: true,
                    channel: true,
                    collaboration_members: true,
                }
            }
        }
    });

    if (!author) {
        throw new SocketEventError("Oups! Il y a eu une erreur lors du traitement de la requête", "E4748");
    }

    const author_team_data = author.team;
    const author_user_data = author.user;

    const returnData = {
        collaboration: author.collaborations[0],
        author_username: author.is_team ? author_team_data!.team_name : author_user_data!.profile!.username,
        author_avatar_url: author.is_team ? author_team_data!.avatar_url : author_user_data!.profile!.avatar_url,
        currentMemberCount: author.collaborations[0].collaboration_members.length,
        title: author.collaborations[0].drawing!.title,
        thumbnail_url: author.collaborations[0].drawing!.thumbnail_url,
        drawingId: author.collaborations[0].drawing!.drawing_id,
        channelId: author.collaborations[0].channel_id,
        bgColor: author.collaborations[0].drawing!.background_color
    }

    return returnData;
}