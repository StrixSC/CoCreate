import { MemberType } from '@prisma/client';
import { getOnlineMembersInRoom } from './../../../utils/socket';
import { SocketEventError } from './../../../socket';
import { db } from './../../../db';
import { handleSocketError } from './../../../utils/errors';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { findTeamById } from './join.handler';

export const handleLeave = async (io: Server, socket: Socket, data: { teamId: string }) => {
    try {
        const team = await findTeamById(data.teamId);

        if (!team) {
            throw new SocketEventError('Oups... Il y eu une erreur lors du traitement de la requête, veuillez essayez à nouveau SVP!', 'E1031');
        }

        const member = team.team_members.find((tm) => tm.user_id === socket.data.user);
        if (!member) {
            throw new SocketEventError('Oups! On dirait que l\'utilisateur ne fait pas partie de cette équipe. Si cela est une erreur, veuillez contacter un administrateur', 'E1030');
        }

        if (member.type === MemberType.Owner) {
            throw new SocketEventError("Hmm... On dirait que vous êtes le propriétaire de cette équipe, il faudrait plutôt supprimer l'équipe si vous comptez la quitter...");
        }

        const [deletedMember, deletedChannelMember] = await db.$transaction([
            db.teamMember.deleteMany({
                where: {
                    team_id: team.team_id,
                    user_id: socket.data.user
                },
            }),
            db.channelMember.deleteMany({
                where: {
                    channel_id: team.channel_id,
                    user_id: socket.data.user
                }
            })
        ]);

        if (!deletedMember || !deletedChannelMember) {
            throw new SocketEventError(`Oups... Quelque chose s'est produit lors du traitement de la requête, veuillez réessayez à nouveau SVP.`);
        } else {

            io.to(team.channel_id).emit('channel:left', {
                channelId: team.channel_id,
                channelType: team.channel.type,
            });

            const onlineMembers = getOnlineMembersInRoom(team.team_id);

            io.emit('teams:left', {
                userId: member.user_id,
                username: member.user.profile!.username,
                avatarUrl: member.user.profile!.avatar_url,
                currentMemberCount: team.team_members.length - 1,
                maxMemberCount: team.max_member_count,
                onlineMembersCount: onlineMembers.length
            });

            socket.leave(team.team_id);
            socket.leave(team.channel_id);
        }
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Teams, ExceptionType.Teams_Leave]);
    }
}