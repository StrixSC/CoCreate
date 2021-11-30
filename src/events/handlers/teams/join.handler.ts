import { TeamType, MemberType } from "@prisma/client";
import { db } from "../../../db";
import { Socket, Server } from 'socket.io';
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { handleSocketError } from "../../../utils/errors";
import axios from "axios";

export const handleJoin = async (io: Server, socket: Socket, data: {
    teamId: string,
    password?: string,
}) => {
    try {
        const userId = socket.data.user;
        const team = await findTeamById(data.teamId);
        if (!team) {
            throw new SocketEventError("Cette équipe n'existe pas dans nos records...", "E4101");
        }

        if (team.team_members.find((tm) => tm.user_id === userId)) {
            throw new SocketEventError("L'utilisateur fait déjà partie de cette équipe...", "E4102");
        }

        if (team.type === TeamType.Protected && !data.password) {
            throw new SocketEventError("Erreur: Il faut fournir un mot de passe pour pouvoir joindre une équipe protégée.", "E4104");
        } else if (team.type === TeamType.Protected && data.password !== team.password) {
            throw new SocketEventError("Erreur: Le mot de passe fournit ne correspond pas au mot de passe de l'équipe...", "E4105");
        }

        if (team.team_members.length >= team.max_member_count) {
            throw new SocketEventError("Il ne reste plus aucune place dans cette équipe, malheureusement!", "E4103");
        }

        const member = await addUserToTeam(userId, team.team_id);
        if (!member) {
            throw new SocketEventError("Une erreur s'est produit lors de l'ajout de l'utilisateur à l'équipe, réessayez à nouveau plus tard!");
        }
        else {
            socket.emit('teams:join:finished');

            io.emit('teams:joined', {
                teamId: team.team_id,
                member: member.user_id
            });

            io.to(team.team_id).emit('teams:new-member', {
                username: member.user.profile!.username,
                userId: member.user_id,
                avatarUrl: member.user.profile!.avatar_url,
                status: 1,
            });

            socket.join(team.team_id);
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Teams_Join);
    }
}

export const findTeamById = async (teamId: string) => {
    const team = db.team.findUnique({
        where: {
            team_id: teamId,
        },
        include: {
            team_members: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            account: true,
                        }
                    }
                }
            },
            authored_drawings: {
                include: {
                    collaborations: {
                        include: {
                            drawing: true
                        }
                    }
                }
            }
        }
    });
    return team;
};

export const addUserToTeam = async (userId: string, teamId: string) => {
    const user = await db.teamMember.create({
        data: {
            team_id: teamId,
            type: MemberType.Regular,
            user_id: userId
        },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    });

    return user;
}