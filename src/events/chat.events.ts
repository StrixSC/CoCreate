import { getSinglePublicProfileById } from './../services/users.service';
import { Prisma } from '.prisma/client';
import create from 'http-errors';
import { ISendMessagePayload } from '../models/ISendMessagePayload.model';
import { Server, Socket } from 'socket.io';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';
import {
    joinChannel as addUserToChannel,
    leaveChannel as removeUserFromChannel
} from './../services/channels.service';
import moment from 'moment';
import { IChannelIOPayload } from '../models/IJoinChannelPayload.model';
import chalk from 'chalk';
import { dbErrorRouters } from '../utils/auth';

export = (io: Server, socket: Socket) => {
    const userId = (socket as any).request.session.passport.user;
    const joinChannel = async (joinChannelPayload: IChannelIOPayload) => {
        try {
            const member = await addUserToChannel({ ...joinChannelPayload, userId: userId });
            if (!member) {
                throw new create.InternalServerError('Could not add user to channel.');
            }

            socket.to(joinChannelPayload.channelId).emit('user-connection', {
                username: 'Système',
                message: `${member.member.profile?.username} s'est connecté! 😄`,
                timestamp: moment().format('HH:mm:ss')
            });
        } catch (e: any) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                const error = dbErrorRouters[e.code];
                if (error) return socket.emit('exception', create(error.statusCode, error.message));
                else return socket.emit('exception', create(create.InternalServerError));
            }
            return socket.emit('exception', create(e.status, e.message));
        }
    };

    const sendMessage = (messagePayload: ISendMessagePayload) => {
        io.to(messagePayload.channel_id).emit('receive-message', {
            message: messagePayload.message,
            username: socket.data.username,
            timestamp: moment().format('HH:mm:ss')
        } as IReceiveMessagePayload);
    };

    const leaveChannel = async (payload: IChannelIOPayload) => {
        try {
            const member = await removeUserFromChannel({
                ...payload,
                userId: userId
            });

            if (!member) {
                throw new create.InternalServerError('Could not remove user from channel.');
            }

            socket.to(payload.channelId).emit('user-disconnect', {
                username: 'Système',
                message: `${member.member.profile?.username} s'est déconnecté... 😭`,
                timestamp: moment().format('HH:mm:ss')
            } as IReceiveMessagePayload);
        } catch (e: any) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(chalk.red(e.code));
                const error = dbErrorRouters[e.code];
                if (error) return socket.emit('exception', create(error.statusCode, error.message));
                else return socket.emit('exception', create(create.InternalServerError));
            }
            return socket.emit('exception', create(e.status, e.message));
        }
    };

    const userDisconnect = async (reason: string) => {
        try {
            const member = await getSinglePublicProfileById(userId);
            if (!member) {
                throw new create.InternalServerError('Could not retrieve member.');
            }

            socket.rooms.forEach((room) => {
                socket.to(room).emit('user-disconnect', {
                    username: 'Système',
                    message: `${member.username} s'est déconnecté... 😭`,
                    timestamp: moment().format('HH:mm:ss')
                });
            });

            socket.emit('self-disconnect', {
                message: reason
            });
        } catch (e: any) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(chalk.red(e.code));
                const error = dbErrorRouters[e.code];
                if (error) return socket.emit('exception', create(error.statusCode, error.message));
                else return socket.emit('exception', create(create.InternalServerError));
            }
            return socket.emit('exception', create(e.status, e.message));
        }
    };

    socket.on('send-message', sendMessage);
    socket.on('join-channel', joinChannel);
    socket.on('leave-channel', leaveChannel);
    socket.on('disconnect', userDisconnect);
};
