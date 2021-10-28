import { handleSocketError } from './../utils/errors';
import { MemberType, ChannelMember } from '.prisma/client';
import { db } from './../db';
import { SocketEventError } from './../socket';
import { Server, Socket } from 'socket.io';
import validator from 'validator';
import log from '../utils/logger';

const validateChannelId = (channelId: string) => {
    if (!channelId || validator.isEmpty(channelId)) {
        throw new SocketEventError('Channel ID cannot be empty', 'E1001');
    }

    if (!validator.isAscii(channelId)) {
        throw new SocketEventError('Channel ID must only contain valid ASCII symbols.', 'E1002');
    }
};

const validateChannelName = (channelName: string) => {
    if (
        validator.isEmpty(channelName) ||
        !validator.isLength(channelName, {
            min: 4,
            max: 255
        })
    ) {
        new SocketEventError('Channel name must be betwen 4 and 255 characters', 'E1006');
    }

    if (!validator.isAscii(channelName.toString())) {
        new SocketEventError('Channel name must only contain ascii symbols.', 'E1007');
    }
};

export = (io: Server, socket: Socket) => {
    const joinChannel = async (data: { channelId: string }) => {
        const { channelId } = data;
        try {
            validateChannelId(channelId);
            const channel = await db.channel.findUnique({
                where: {
                    channel_id: channelId
                },
                include: {
                    members: true
                }
            });

            if (!channel)
                throw new SocketEventError(
                    'Channel could not be found in the list of channels',
                    'E1003'
                );

            const userIsAlreadyAMember = channel.members.findIndex(
                (c: ChannelMember) => c.user_id === socket.data.user
            );

            if (userIsAlreadyAMember !== -1) {
                throw new SocketEventError(
                    'Cannot add user as a member of this channel: User is already a member of this channel.',
                    'E1004'
                );
            }

            const createdMember = await db.channelMember.create({
                data: {
                    channel_id: channel.channel_id,
                    type: MemberType.Regular,
                    user_id: socket.data.user
                }
            });

            if (!createdMember)
                throw new SocketEventError(
                    'The member could not be added to the channel. Reason: Internal Server Error',
                    'E1005'
                );

            socket.join(channel.channel_id.toString());

            return io.to(channelId).emit('channel:joined', {
                channel_id: channel.channel_id,
                name: channel.name
            });
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    const createChannel = async (data: { channelName: string }) => {
        try {
            const { channelName } = data;

            validateChannelName(channelName);

            const channel = await db.channel.create({
                data: {
                    name: channelName,
                    members: {
                        create: [{ user_id: socket.data.user, type: 'Owner' }]
                    }
                }
            });

            if (!channel)
                throw new SocketEventError(
                    'Channel could not be created. Internal Socket Server Error',
                    'E1008'
                );

            socket.join(channel.channel_id.toString());

            socket.emit('channel:created', {
                channel_id: channel.channel_id,
                name: channel.name,
                created_at: channel.created_at,
                updated_at: channel.updated_at,
                collaboration_id: channel.collaboration_id || null
            });
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    const leaveChannel = async (data: { channelId: string }) => {
        try {
            const { channelId } = data;

            validateChannelId(channelId);

            const channelMember = await db.channelMember.findFirst({
                where: {
                    user_id: socket.data.user,
                    channel_id: channelId
                },
                include: {
                    channel: true,
                    member: true
                }
            });

            if (!channelMember) {
                throw new SocketEventError(
                    'Could not leave channel: User is not a member of this channel.',
                    'E1009'
                );
            }

            if ((channelMember.type = MemberType.Owner)) {
                throw new SocketEventError(
                    'Could not leave channel: User is channel owner.',
                    'E1010'
                );
            }

            io.to(channelId).emit('channel:left', {
                channelId: channelId
            });
            socket.leave(channelId);
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    const updateChannel = async (data: { channelId: string; channelName: string }) => {
        try {
            const { channelId, channelName } = data;
            validateChannelId(channelId);
            validateChannelName(channelName);

            const channelMember = await db.channelMember.findFirst({
                where: {
                    channel_id: channelId,
                    user_id: socket.data.user
                },
                include: {
                    channel: true,
                    member: true
                }
            });

            if (!channelMember) {
                throw new SocketEventError(
                    'Could not update channel: User is not a member of this channel',
                    'E1010'
                );
            }

            if (channelMember.type !== MemberType.Owner) {
                throw new SocketEventError(
                    'Could not update channel: User is not the owner this channel',
                    'E1011'
                );
            }

            const channelAlreadyExists = await db.channel.findFirst({
                where: {
                    name: channelName
                }
            });

            if (channelAlreadyExists) {
                throw new SocketEventError(
                    'Could not update channel: Channel name is already taken.',
                    'E1012'
                );
            }

            const channel = await db.channel.update({
                where: {
                    channel_id: channelId
                },
                data: {
                    name: channelName,
                    updated_at: new Date()
                }
            });

            if (!channel) {
                throw new SocketEventError(
                    'Could not update channel: Internal Socket Server Error',
                    'E1013'
                );
            }

            io.to(channelId).emit('channel:updated', {
                channelId: channel.channel_id,
                channelName: channel.name,
                updatedAt: channel.updated_at
            });
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    const deleteChannel = async (data: { channelId: string }) => {
        try {
            const { channelId } = data;
            validateChannelId(channelId);

            const member = await db.channelMember.findFirst({
                where: {
                    channel_id: channelId,
                    user_id: socket.data.user
                },
                include: {
                    channel: true,
                    member: true
                }
            });

            if (!member) {
                throw new SocketEventError(
                    'Could not delete channel: Channel could not be found or member is not a part of this channel.',
                    'E1015'
                );
            }

            if (member.type !== MemberType.Owner) {
                throw new SocketEventError(
                    'Could not delete channel: User is not the owner of this channel',
                    'E1016'
                );
            }

            const channel = await db.channel.delete({
                where: {
                    channel_id: channelId
                }
            });

            if (!channel) {
                throw new SocketEventError(
                    'Could not delete channel: Internal Socket Server Error',
                    'E1017'
                );
            }

            io.to(channelId).emit('channel:deleted', {
                channelId: channel.channel_id
            });

            io.in(channelId).socketsLeave(channelId);
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    socket.on('channel:join', joinChannel);
    socket.on('channel:create', createChannel);
    socket.on('channel:leave', leaveChannel);
    socket.on('channel:update', updateChannel);
    socket.on('channel:delete', deleteChannel);
};
