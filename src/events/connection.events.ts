import { LogType } from '.prisma/client';
import { IConnectionEventData } from './../models/IUser.model';
import { getOnlineMembersInRoom } from './../utils/socket';
import { ExceptionType } from './../models/Exceptions.enum';
import { handleSocketError } from './../utils/errors';
import { SocketEventError } from './../socket';
import { db } from './../db';
import { Socket, Server } from 'socket.io';
import { UserStatusTypes } from '../models/IUser.model';
export = (io: Server, socket: Socket) => {
    socket.on('disconnecting', async () => {
        console.log('disconnecting client', socket.data.username);
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
        });
        try {
            await db.log.create({
                data: {
                    type: LogType.Disconnection,
                    user_id: socket.data.user
                }
            });
        } catch (e) {
            console.error('User log error', socket.data.user);
        }
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
                teams: {
                    include: {
                        team: true
                    }
                },
                channels: {
                    include: {
                        channel: true
                    }
                },
                profile: true,
            }
        });

        if (!user) {
            throw new SocketEventError("Oups! Il y a eu une erreur lors d'un traitement au Serveur, veuillez contacter un administrateur", "E0100");
        }

        const allActiveSockets = io.sockets.sockets;
        allActiveSockets.forEach(async (s) => {
            if (s.data.user && s.data.user === user.user_id && s.id !== socket.id) {
                console.log(s.data.user, s.rooms);
                const rooms = s.rooms;
                for (let room of rooms) {
                    s.leave(room);
                }
                s.emit('user:init:exception', { message: "(E4555) - Vous avez été désauthentifié, car ce compte est connecté sur un client en parallèle." });
                try {
                    await db.log.create({
                        data: {
                            type: LogType.Disconnection,
                            user_id: s.data.user_id
                        }
                    });
                } catch (e) {
                    console.error('User log error', user.user_id);
                }
                s.disconnect();
            }
        })

        for (let channel of user.channels) {
            socket.join(channel.channel_id)
        }

        for (let team of user.teams) {
            socket.join(team.team_id)
        }

        try {
            await db.log.create({
                data: {
                    type: LogType.Connection,
                    user_id: user.user_id
                }
            });
        } catch (e) {
            console.error('User log error', user.user_id);
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