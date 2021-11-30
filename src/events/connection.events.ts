import { ExceptionType } from './../models/Exceptions.enum';
import { handleSocketError } from './../utils/errors';
import { SocketEventError } from './../socket';
import { db } from './../db';
import { Socket, Server } from 'socket.io';
export = (io: Server, socket: Socket) => {
    socket.on('disconnect', () => {
        socket.rooms.forEach((room) => {
            io.to(room).emit("user:disconnection", {
                userId: socket.data.user
            })
        })
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

        user.teams.forEach((t) => {
            socket.join(t.team_id);
        });

        user.channels.forEach((c) => {
            socket.join(c.channel_id);
        });

        socket.data.status = "En ligne"

        socket.emit('user:initialized')
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.User_Init)
    }
}