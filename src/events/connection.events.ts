import { IConnectionEventData } from './../models/IUser.model';
import { getOnlineMembersInRoom } from './../utils/socket';
import { ExceptionType } from './../models/Exceptions.enum';
import { handleSocketError } from './../utils/errors';
import { SocketEventError } from './../socket';
import { db } from './../db';
import { Socket, Server } from 'socket.io';
import { UserStatusTypes } from '../models/IUser.model';
export = (io: Server, socket: Socket) => {

    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => {
            const onlineMembers = getOnlineMembersInRoom(room);
            socket.data.status = UserStatusTypes.Offline,
                io.to(room).emit("user:disconnected", {
                    userId: socket.data.user,
                    roomId: room,
                    username: socket.data.username,
                    avatarUrl: socket.data.avatarUrl,
                    status: socket.data.status,
                    onlineMemberCount: onlineMembers.length - 1,
                } as IConnectionEventData)
        })
    })

    socket.on('disconnect', () => {
        io.emit('disconnection:complete');
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
                profile: true,
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

        socket.data.username = user.profile!.username;
        socket.data.avatarUrl = user.profile!.avatar_url;
        socket.data.status = UserStatusTypes.Online;
        socket.emit('user:initialized');

        socket.rooms.forEach((room) => {
            const onlineMembers = getOnlineMembersInRoom(room);
            io.to(room).emit('user:connected', {
                onlineMemberCount: onlineMembers.length,
                userId: socket.data.user,
                roomId: room,
                username: user.profile!.username,
                avatarUrl: user.profile!.avatar_url,
                status: socket.data.status
            } as IConnectionEventData);
        });

        io.emit('connection:completed');
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.User_Init)
    }
}