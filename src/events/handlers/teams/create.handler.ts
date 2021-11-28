import { TeamType, MemberType } from "@prisma/client";
import { db } from "../../../db";
import { Socket, Server } from 'socket.io';
import { ExceptionType } from "../../../models/Exceptions.enum";
import { SocketEventError } from "../../../socket";
import { handleSocketError } from "../../../utils/errors";
import axios from "axios";

export const handleCreate = async (io: Server, socket: Socket, data: {
    teamName: string,
    bio: string,
    maxMemberCount: number,
    type: TeamType,
    password?: string,
    mascot?: string,
}) => {
    try {
        const { teamName, bio, maxMemberCount, type, password, mascot } = data;
        const team = await createTeam(socket.data.user, teamName, bio, maxMemberCount, type, password, mascot);
        socket.emit('teams:create:finished', team);
        io.emit('teams:created', team);
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Teams_Create);
    }
}

const createTeam = async (userId: string, teamName: string, bio: string, maxMemberCount: number, type: TeamType, password?: string, mascot?: string) => {
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

    const avatarUrl = "https://source.unsplash.com/random/300x300/?" + mascot;
    let redirectedAvatarUrl = "";
    try {
        const response = await axios.get(avatarUrl);

        if (response) {
            redirectedAvatarUrl = response.request.res.responseUrl;
            console.log(redirectedAvatarUrl);
        }
    } catch (e) {
    }

    const createdTeam = await db.team.create({
        data: {
            team_name: teamName,
            type: type,
            max_member_count: maxMemberCount,
            avatar_url: redirectedAvatarUrl,
            mascot: mascot,
            mascot_url: avatarUrl,
            bio: bio,
            password: password,
            team_members: {
                create: [
                    { user_id: userId, type: MemberType.Owner }
                ]
            }
        },
        include: {
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
            author_username: createdTeam.team_members[0].user.profile!.username,
            author_avatar_url: createdTeam.team_members[0].user.profile!.avatar_url,
            currentMemberCount: createdTeam.team_members.length,
            maxMemberCount: createdTeam.max_member_count,
            teamName: createdTeam.team_name,
            bio: createdTeam.bio,
            type: createdTeam.type,
        }
    }
}