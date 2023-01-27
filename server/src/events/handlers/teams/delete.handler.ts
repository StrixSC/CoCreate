import { MemberType } from '@prisma/client';
import { getOnlineMembersInRoom } from './../../../utils/socket';
import { SocketEventError } from './../../../socket';
import { db } from './../../../db';
import { handleSocketError } from './../../../utils/errors';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { findTeamById } from './join.handler';

export const handleDelete = async (io: Server, socket: Socket, data: { teamId: string }) => {
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

        let deletedCollabInfo: { channelId: string, collaborationId: string }[] = [];
        team.authored_drawings.forEach((authored_drawings) => {
            authored_drawings.collaborations.forEach((c) => {
                deletedCollabInfo.push({ channelId: c.channel_id, collaborationId: c.collaboration_id });
            })
        });

        const [deletedTeam, deletedChannel, deletedCollaborationChannels] = await db.$transaction([
            db.team.delete({
                where: {
                    team_id: team.team_id,
                }
            }),
            db.channel.delete({
                where: {
                    channel_id: team.channel_id
                }
            }),
            db.channel.deleteMany({
                where: {
                    channel_id: {
                        in: deletedCollabInfo.map((c) => c.channelId)
                    }
                }
            })
        ]);

        if (!deletedChannel || !deletedTeam) {
            throw new SocketEventError(`Oups... Quelque chose s'est produit lors du traitement de la requête, veuillez réessayez à nouveau SVP.`);
        } else {
            socket.emit('teams:delete:finished');

            io.emit('teams:deleted', {
                teamId: deletedTeam.team_id
            });

            io.to(deletedChannel.channel_id).emit('channel:deleted', {
                channelId: deletedChannel.channel_id
            })

            for (let c of deletedCollabInfo) {
                io.to(c.collaborationId).emit('collaboration:deleted');
                io.to(c.channelId).emit('channel:deleted');
                io.socketsLeave(c.channelId);
                io.socketsLeave(c.collaborationId);
            }

            io.socketsLeave(deletedChannel.channel_id);
            io.socketsLeave(deletedTeam.team_id);
        }
    } catch (e) {
        handleSocketError(socket, e, undefined, [ExceptionType.Teams, ExceptionType.Teams_Delete])
    }
}