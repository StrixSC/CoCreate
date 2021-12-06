import { IConnectionEventData } from './../../../models/IUser.model';
import { TeamType, MemberType } from "@prisma/client";
import { db } from "../../../db";
import { Socket, Server } from 'socket.io';
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { handleSocketError } from "../../../utils/errors";

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

        const member = await addUserToTeam(userId, team.team_id, team.channel_id);
        if (!member) {
            throw new SocketEventError("Une erreur s'est produit lors de l'ajout de l'utilisateur à l'équipe, réessayez à nouveau plus tard!");
        }

        let collaborations: string[] = [];
        member.team.authored_drawings.forEach((authored_drawings) => {
            authored_drawings.collaborations.forEach((c) => {
                collaborations.push(c.collaboration_id);
            })
        });

        const done = await addUserToCollaboration(userId, collaborations);

        if (!done) {
            throw new SocketEventError("Une erreur s'est produite lors de l'ajout de l'utilisateur en tant que membre aux dessins de l'équipe.")
        }

        socket.emit('teams:join:finished');

        const connectionData = {
            username: member.user.profile!.username,
            userId: member.user_id,
            avatarUrl: member.user.profile!.avatar_url,
            status: socket.data.status,
            roomId: team.team_id,
            channelId: team.channel_id,
            channelName: member.team.channel.name,
            collaborationId: null,
        } as IConnectionEventData;

        socket.join(team.team_id);
        socket.join(team.channel_id);

        io.to(member.team.team_id).emit('teams:joined', connectionData);
        io.to(member.team.channel_id).emit('channels:joined', connectionData)

        for (let collaboration of collaborations) {
            io.emit("collaboration:joined", { ...connectionData, roomId: collaboration });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Teams_Join);
    }
}

export const findTeamById = async (teamId: string) => {
    const team = await db.team.findUnique({
        where: {
            team_id: teamId,
        },
        include: {
            channel: true,
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

export const addUserToTeam = async (userId: string, teamId: string, channelId: string) => {
    const [teamMember, channelMember] = await db.$transaction([
        db.teamMember.create({
            data: {
                team_id: teamId,
                type: MemberType.Regular,
                user_id: userId,
            },
            include: {
                team: {
                    include: {
                        channel: true,
                        authored_drawings: {
                            include: {
                                collaborations: true,
                            }
                        },
                    }
                },
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        }),
        db.channelMember.create({
            data: {
                channel_id: channelId,
                type: MemberType.Regular,
                user_id: userId,
            }
        })
    ]);

    return teamMember;
}

export const addUserToCollaboration = async (userId: string, collaborationIds: string[]) => {
    const batch = collaborationIds.map((c) => ({
        type: MemberType.Regular,
        collaboration_id: c,
        user_id: userId
    }));

    try {
        await db.collaborationMember.createMany({
            data: batch
        });
    } catch (e) {
        return false;
    }

    return true;
}
