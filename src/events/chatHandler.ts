import { ISendMessagePayload } from './../models/ISendMessagePayload.model';
import { IUser } from './../models/IUser.model';
import { Server, Socket } from 'socket.io';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';

const users = [];

export = (io: Server, socket: Socket) => {
	const joinChannel = (user: IUser) => {
		socket.broadcast.emit(
			'user-connection',
			`${user.username} has connected!`
		);
	}

	const sendMessage = (messagePayload: ISendMessagePayload) => {
		io.sockets.emit('receive-message', {
			message: messagePayload.message,
			username: "helloworld",
			timestamp: new Date().toLocaleString(),
		} as IReceiveMessagePayload);
	}

	const userDisconnect = () => {
		socket.broadcast.emit('user-disconnect', `User has disconnected`);
	}

	socket.on('send-message', sendMessage);
	socket.on('join-channel', joinChannel);
	socket.on('disconnect', userDisconnect);
};
