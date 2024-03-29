import { ChannelType } from '.prisma/client';
import { generateMascotProfile } from './../../../services/teams.service';
import { TeamType, MemberType } from "@prisma/client";
import { db } from "../../../db";
import { Socket, Server } from 'socket.io';
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { handleSocketError } from "../../../utils/errors";

export const handleCreate = async (io: Server, socket: Socket, data: {
    teamName: string,
    bio: string,
    maxMemberCount: number,
    type: TeamType,
    mascot: string,
    password?: string,
}) => {
    try {
        const { teamName, bio, maxMemberCount, type, password, mascot } = data;
        const team = await createTeam(socket.data.user, teamName, bio, maxMemberCount, type, mascot, password);
        socket.join(team.teamId);
        socket.join(team.channel_id);
        socket.emit('channel:joined', {
            channelId: team.channel_id,
            channelName: team.channelName,
            channelType: team.channelType,
            collaborationId: team.collaborationId
        });
        socket.emit('teams:create:finished', team);
        io.emit('teams:created', team);
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Teams, ExceptionType.Teams_Create]);
    }
}

const createTeam = async (userId: string, teamName: string, bio: string, maxMemberCount: number, type: TeamType, mascot: string, password?: string,) => {
    const existingTeam = await db.team.findFirst({
        where: {
            team_name: teamName
        }
    });

    if (existingTeam) {
        throw new SocketEventError('Il existe déjà une équipe avec ce nom. Choisissez un nom unique.', 'E4001');
    }

    if (type !== TeamType.Protected && type !== TeamType.Public) {
        throw new SocketEventError("Le choix du type n'est pas valide, assurez-vous que le type est définit à soit 'Protégé' ou 'Public'.", 'E4003');
    }

    if (type === TeamType.Protected && !password) {
        throw new SocketEventError("L'équipe a été mise à protégée, mais aucun mot de passe a été fournit.", 'E4002');
    }

    const mascotProfile = await generateMascotProfile(mascot);

    const createdTeam = await db.team.create({
        data: {
            team_name: teamName,
            type: type,
            max_member_count: maxMemberCount,
            avatar_url: mascotProfile.redirectedAvatarUrl,
            mascot: mascot,
            mascot_url: mascotProfile.avatarUrl,
            bio: bio,
            password: password,
            team_members: {
                create: [
                    { user_id: userId, type: MemberType.Owner }
                ]
            },
            channel: {
                create: {
                    name: teamName,
                    type: ChannelType.Team,
                    members: {
                        create: [
                            { user_id: userId, type: MemberType.Owner }
                        ]
                    }
                }
            }
        },
        include: {
            channel: true,
            team_members: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            account: true
                        }
                    }
                }
            }
        }
    });

    if (!createdTeam) {
        throw new SocketEventError("Une erreur est survenue lors de la création de l'équipe. Veuillez essayez à nouveau.");
    } else {
        return {
            teamId: createdTeam.team_id,
            author_username: createdTeam.team_members[0].user.profile!.username,
            author_avatar_url: createdTeam.team_members[0].user.profile!.avatar_url,
            currentMemberCount: createdTeam.team_members.length,
            maxMemberCount: createdTeam.max_member_count,
            onlineMemberCount: 1,
            teamName: createdTeam.team_name,
            teamAvatarUrl: createdTeam.avatar_url,
            bio: createdTeam.bio,
            type: createdTeam.type,
            channel_id: createdTeam.channel_id,
            channelName: createdTeam.channel.name.replace,
            collaborationId: null,
            channelType: createdTeam.channel.type,
        }
    }
}