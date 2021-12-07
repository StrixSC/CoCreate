import { TeamType } from '@prisma/client';
import { getNewMascotUrl, generateMascotProfile } from './../../../services/teams.service';
import { MemberType } from '@prisma/client';
import { getOnlineMembersInRoom } from './../../../utils/socket';
import { SocketEventError } from './../../../socket';
import { db } from './../../../db';
import { handleSocketError } from './../../../utils/errors';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { findTeamById } from './join.handler';

export const handleUpdate = async (io: Server, socket: Socket, data: { teamId: string, teamName?: string, bio?: string, maxMemberCount?: number, type?: TeamType, mascot?: string, password?: string }) => {
    try {
        const team = await findTeamById(data.teamId);

        if (!team) {
            throw new SocketEventError('Oups... Il y eu une erreur lors du traitement de la requête, veuillez essayez à nouveau SVP!', 'E1031');
        }

        const member = team.team_members.find((tm) => tm.user_id === socket.data.user);
        if (!member) {
            throw new SocketEventError('Oups! On dirait que l\'utilisateur ne fait pas partie de cette équipe. Si cela est une erreur, veuillez contacter un administrateur', 'E1030');
        }

        if (member.type !== MemberType.Owner) {
            throw new SocketEventError("Hmm... On dirait que vous n'êtes pas le propriétaire de cette équipe...");
        }

        if (team.type !== data.type && (data.type === TeamType.Protected && (!data.password || data.password.length < 8 || data.password.length > 256))) {
            throw new SocketEventError("Oops, vous avez tentez de changer la visibilité de votre équipe, mais vous n'avez pas fournit un mot de passe valide.", "E1032");
        }

        let newMascotUrl = team.mascot_url;
        let newAvatarUrl = team.avatar_url;
        if (data.mascot && data.mascot !== team.mascot) {
            if (data.mascot !== team.mascot) {
                const mascotProfile = await generateMascotProfile(data.mascot);
                newMascotUrl = mascotProfile.avatarUrl;
                newAvatarUrl = mascotProfile.redirectedAvatarUrl;
            } else {
                newAvatarUrl = await getNewMascotUrl(team.mascot_url);
            }
        }

        const updated = await db.team.update({
            where: {
                team_id: team.team_id,
            },
            data: {
                team_name: data.teamName,
                mascot: data.mascot,
                avatar_url: newAvatarUrl,
                mascot_url: newMascotUrl,
                bio: data.bio,
                type: data.type,
                password: data.password,
                max_member_count: data.maxMemberCount,
                channel: {
                    update: {
                        name: data.teamName
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

        socket.emit('teams:update:finished', {
            name: updated.team_name
        });

        const onlineMembers = getOnlineMembersInRoom(updated.team_id);
        io.to(team.channel_id).emit('channel:updated', {
            channelId: updated.channel_id,
            channelName: updated.channel.name,
            updatedAt: updated.channel.updated_at,
        });
        io.emit('teams:updated', {
            teamId: updated.team_id,
            authorUsername: member.user.profile!.username,
            authorAvatarUrl: member.user.profile!.avatar_url,
            currentMemberCount: updated.team_members.length,
            maxMemberCount: updated.max_member_count,
            onlineMemberCount: onlineMembers.length,
            teamName: updated.team_name,
            teamAvatarUrl: updated.avatar_url,
            bio: updated.bio,
            type: updated.type,
            mascot: updated.mascot,
        });
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Teams, ExceptionType.Teams_Update])
    }
}