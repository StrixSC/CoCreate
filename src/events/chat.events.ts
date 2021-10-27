import { getSinglePublicProfileById } from './../services/users.service';
import { Prisma } from '.prisma/client';
import create from 'http-errors';
import { ISendMessagePayload } from '../models/ISendMessagePayload.model';
import { Server, Socket } from 'socket.io';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';
import {
    addUserMessage,
    joinChannel as addUserToChannel,
    leaveChannel as removeUserFromChannel
} from './../services/channels.service';
import moment from 'moment';
import { IChannelIOPayload } from '../models/IJoinChannelPayload.model';
import { dbErrorRouters } from '../utils/auth';
import chalk from 'chalk';

export = (io: Server, socket: Socket) => {
    console.log(chalk.greenBright('[INFO]::Socket Event Triggered::'));
    const userId = (socket as any).request.session.passport.user;
    const joinChannel = async (joinChannelPayload: IChannelIOPayload) => {
        try {
            const member = await addUserToChannel({
                ...joinChannelPayload,
                userId: userId
            });
            if (!member) {
                throw new create.InternalServerError('Could not add user to channel.');
            }

            socket.join(joinChannelPayload.channelId);
            io.to(joinChannelPayload.channelId).emit('user-connection', {
                username: 'Système',
                message_data: `${member.username} s'est connecté! 😄`,
                timestamp: moment().format('HH:mm:ss'),
                avatar_url: '',
                message_id: 'SystemMessage',
                sender_profile_id: 'SYSTEM'
            } as IReceiveMessagePayload);
        } catch (e: any) {
            return handleError(e);
        }
    };

    const sendMessage = async (messagePayload: ISendMessagePayload) => {
        try {
            const message = await addUserMessage({
                ...messagePayload,
                user_id: userId
            });
            if (!message) throw new create.InternalServerError('Could not find the message');

            io.to(messagePayload.channel_id).emit('receive-message', message);
        } catch (e: any) {
            return handleError(e);
        }
    };

    const leaveChannel = async (payload: IChannelIOPayload) => {
        try {
            const member = await removeUserFromChannel({
                ...payload,
                userId: userId
            });

            if (!member)
                throw new create.InternalServerError('Could not remove user from channel.');

            io.to(payload.channelId).emit('user-disconnect', {
                username: 'Système',
                message: `${member.username} s'est déconnecté... 😭`,
                timestamp: moment().format('HH:mm:ss'),
                avatar_url: '',
                message_id: 'SystemMessage',
                sender_profile_id: 'SYSTEM'
            });
        } catch (e: any) {
            return handleError(e);
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
                    timestamp: moment().format('HH:mm:ss'),
                    avatar_url: '',
                    message_id: 'SystemMessage',
                    sender_profile_id: 'SYSTEM'
                });
            });

            socket.emit('self-disconnect', {
                message: reason
            });
        } catch (e: any) {
            return handleError(e);
        }
    };

    const handleError = (e: any): boolean => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            const error = dbErrorRouters[e.code];
            if (error) return socket.emit('exception', create(error.statusCode, error.message));
            else return socket.emit('exception', create(create.InternalServerError));
        }
        return socket.emit('exception', create(e.status, e.message));
    };

    socket.on('send-message', sendMessage);
    socket.on('join-channel', joinChannel);
    socket.on('leave-channel', leaveChannel);
    socket.on('disconnect', userDisconnect);
};
