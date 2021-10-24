import { Socket } from 'socket.io';
import { users } from '../utils/chat';

export const usernameCheck = (socket: Socket, next: any) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Vous devez fournir un nom d'utilisateur!"));
    }

    if (users[username]) {
        return next(new Error("Ce nom d'utilisateur est déjà utilisé, choisissez-en en autre!"));
    }

    socket.data.username = username;
    next();
};
