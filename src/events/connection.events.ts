import { getOnlineMembersInRoom } from './../utils/socket';
import { ExceptionType } from './../models/Exceptions.enum';
import { handleSocketError } from './../utils/errors';
import { SocketEventError } from './../socket';
import { db } from './../db';
import { Socket, Server } from 'socket.io';
export = (io: Server, socket: Socket) => {

    socket.on('disconnecting', () => {
        console.log(socket.rooms);
        socket.rooms.forEach((room) => {
            const onlineMembers = getOnlineMembersInRoom(room);
            io.to(room).emit("user:disconnection", {
                userId: socket.data.user,
                roomId: room,
                onlineMemberCount: onlineMembers.length - 1,
            })
        })
    })

    socket.on('disconnect', () => {
    });

    socket.on('user:init', () => initUser(io, socket))
}

const initUser = async (io: Server, socket: Socket) => {
    try {
        if (!socket.data.user) {
            return;
        }

        const user = await db.user.findUnique({
            where: {
                user_id: socket.data.user
            },
            include: {
                teams: true,
                channels: true,
            }
        });

        if (!user) {
            throw new SocketEventError("Oups! Il y a eu une erreur lors d'un traitement au Serveur, veuillez contacter un administrateur", "E0100");
        }

        for (let team of user.teams) {
            const members = getOnlineMembersInRoom(team.team_id);
            if (!members.find((m) => m.userId === socket.data.user)) {
                socket.join(team.team_id)
            } else {
                throw new SocketEventError(`Erreur: l'utilisateur est déjà connecté sur un autre client.`, 'E4518');
            }
        }

        for (let channel of user.channels) {
            const members = getOnlineMembersInRoom(channel.channel_id);
            if (!members.find((m) => m.userId === socket.data.user)) {
                socket.join(channel.channel_id)
            } else {
                throw new SocketEventError(`Erreur: l'utilisateur est déjà connecté sur un client.`, 'E4518');
            }
        }

        socket.data.status = "En ligne"

        socket.emit('user:initialized');

        socket.rooms.forEach((room) => {
            const onlineMembers = getOnlineMembersInRoom(room);
            io.to(room).emit('user:connected', {
                onlineMemberCount: onlineMembers.length,
                userId: socket.data.userId,
                roomId: room
            });
        });
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.User_Init)
    }
}