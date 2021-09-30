import { ISendMessagePayload } from './../models/ISendMessagePayload.model';
import { IUser } from './../models/IUser.model';
import { Server, Socket } from 'socket.io';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';
import { users, getUsers } from '../utils/chat';
import moment from 'moment';

export = (io: Server, socket: Socket) => {
  const joinChannel = () => {
    const user = {
      username: socket.data.username,
      userId: socket.id,
    } as IUser;
    users[socket.data.username] = user;
    socket.emit('get-users', getUsers());
    socket.broadcast.emit('user-connection', user);
  };

  const sendMessage = (messagePayload: ISendMessagePayload) => {
    io.sockets.emit('receive-message', {
      message: messagePayload.message,
      username: socket.data.username,
      timestamp: moment().format('H:MM:SS')
    } as IReceiveMessagePayload);
  };

  const userDisconnect = () => {
    socket.broadcast.emit('user-disconnect', {
      username: socket.data.username,
      userId: socket.id,
    } as IUser);

    try {
      delete users[socket.data.username];
    } catch(e) {
      console.error('Error: ', e);
    }
  };

  socket.on('send-message', sendMessage);
  socket.on('join-channel', joinChannel);
  socket.on('disconnect', userDisconnect);
};