import { Socket } from 'socket.io';
import { users } from '../utils/chat';

export const usernameCheck = (socket: Socket, next: any) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Username not defined'));
  }

  if(users[username]) {
    return next(new Error('Username is already taken'));
  }

  socket.data.username = username;
  next();
};
