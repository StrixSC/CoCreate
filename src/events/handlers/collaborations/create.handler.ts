import { ChannelType, CollaborationType, MemberType } from '.prisma/client';
import create from 'http-errors';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';
import validator from 'validator';
import { db } from '../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from '../../../utils/errors';
import { findTeamById } from '../teams/join.handler';

export const handleCreate = async (io: Server, socket: Socket, payload: {
    userId: string,
    creatorId: string,
    isTeam: boolean,
    title: string,
    type: CollaborationType,
    password?: string
}): Promise<void> => {
    try {
        const { userId, creatorId, isTeam, title, type, password } = payload;

        const isValid = (
            !validator.isEmpty(title) &&
            validator.isLength(title, { min: 8, max: 256 }) &&
            validator.isIn(type, [CollaborationType.Private, CollaborationType.Protected, CollaborationType.Public])
        );

        if (!isValid) {
            throw new create.BadRequest("Title must be a non-empty alphanumeric value with a length between 8 and 256. The type must be either Public, Protected or Private");
        }

        if (isTeam) {
            const team = await findTeamById(creatorId);
            if (!team) {
                throw new create.BadRequest("There are no teams with this id...")
            }

            const member = team.team_members.find((tm) => tm.user_id === userId);
            if (!member) {
                throw new create.Unauthorized("This user cannot be found in the team...");
            }
        }

        if (type === CollaborationType.Private) {
            const data = await createCollaboration(userId, creatorId, isTeam, type, title, password);

            if (!data.collaboration) {
                throw new create.InternalServerError('Error while establishing author and collaboration');
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

            socket.emit("collaboration:created", response);
        } else {
            if (
                type === CollaborationType.Protected &&
                (!password || (password && validator.isEmpty(password)))
            ) {
                throw new create.BadRequest("Collaboration type protected was given but no password (or an empty password) was given with the request.");
            }
            const data = await createCollaboration(userId, creatorId, isTeam, type, title, password);

            if (!data || !data.collaboration) {
                throw new create.InternalServerError("Could not create drawing/collaboration. Internal server error.");
            }

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
        handleSocketError(socket, e, ExceptionType.Collaboration);
    }
}


const createCollaboration = async (user_id: string, creatorId: string, isTeam: boolean, type: CollaborationType, title: string, password?: string) => {
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
                            title: title,
                        }
                    },
                    collaboration_members: {
                        create: [
                            {
                                type: MemberType.Owner,
                                user_id: user_id
                            }
                        ]
                    },
                    channel: {
                        create: {
                            name: `Canal du dessin ${title}`,
                            type: ChannelType.Collaboration,
                            members: {
                                create: [
                                    { user_id: user_id, type: MemberType.Owner }
                                ]
                            }
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
                    collaboration_members: true,
                }
            }
        }
    });

    if (!author) {
        throw new create.InternalServerError('Error while creating author and collaboration');
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
        channelId: author.collaborations[0].channel_id
    }

    return returnData;
}