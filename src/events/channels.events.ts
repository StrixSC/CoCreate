import { handleSocketError } from './../utils/errors';
import { MemberType, ChannelMember } from '.prisma/client';
import { db } from './../db';
import { SocketEventError } from './../socket';
import { Server, Socket } from 'socket.io';
import validator from 'validator';
import moment from 'moment';

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
        throw new SocketEventError('Channel name must be betwen 4 and 255 characters', 'E1006');
    }

    if (!validator.isAscii(channelName.toString())) {
        throw new SocketEventError('Channel name must only contain ascii symbols.', 'E1007');
    }
};

const validateMessage = (message: string) => {
    if (
        validator.isEmpty(message) ||
        !validator.isLength(message, {
            min: 1,
            max: 256
        })
    ) {
        throw new SocketEventError('Message length must be between 1 and 256', 'E1018');
    }
};

export = (io: Server, socket: Socket) => {
    const joinChannel = async (data: { channelId: string }) => {
        try {
            const { channelId } = data;
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

            const userIndex = channel.members.findIndex(
                (c: ChannelMember) => c.user_id === socket.data.user
            );

            if (userIndex === -1) {
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
            }

            socket.join(channel.channel_id.toString());

            return io.to(channelId).emit('channel:joined', {
                channelId: channel.channel_id,
                channelName: channel.name,
                collaborationId: channel.collaboration_id
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
                },
                include: {
                    members: {
                        include: {
                            member: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            });

            if (!channel)
                throw new SocketEventError(
                    'Channel could not be created. Internal Socket Server Error',
                    'E1008'
                );

            socket.join(channel.channel_id.toString());

            io.emit('channel:created', {
                channelId: channel.channel_id,
                channelName: channel.name,
                ownerUsername:
                    channel.members.find((m) => m.type === MemberType.Owner)?.member.profile
                        ?.username || 'Admin',
                createdAt: channel.created_at,
                updatedAt: channel.updated_at,
                collaborationId: channel.collaboration_id || null
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

            socket.leave(channelId);
            socket.emit('channel:left');

            io.to(channelId).emit('channel:left', {
                channelId: channelId
            });

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

    const sendMessage = async (data: { message: string; channelId: string }) => {
        try {
            const { message, channelId } = data;

            validateChannelId(channelId);
            validateMessage(message);

            const channel = await db.channel.findUnique({
                where: {
                    channel_id: channelId
                },
                include: {
                    members: {
                        include: {
                            messages: true,
                            member: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            });

            if (!channel) {
                throw new SocketEventError(
                    'Could not send message: Channel ID does not match any existing channels.',
                    'E1019'
                );
            }

            const userIndex = channel.members.findIndex((m) => m.user_id === socket.data.user);

            if (userIndex === -1) {
                throw new SocketEventError(
                    'Could not send message: The user is not a part of the channel.',
                    'E1020'
                );
            }

            const dbMessage = await db.message.create({
                data: {
                    message_data: message,
                    member_id: channel.members[userIndex].member_id
                }
            });

            if (!dbMessage) {
                throw new SocketEventError(
                    'Could not delete channel: Internal Socket Server Error',
                    'E1021'
                );
            }

            io.to(channel.channel_id).emit('channel:sent', {
                message: message,
                messageId: dbMessage.message_id,
                channelId: channel.channel_id,
                username: channel.members[userIndex].member.profile?.username,
                avatarUrl: channel.members[userIndex].member.profile?.avatar_url,
                createdAt: moment(dbMessage.created_at).format('HH:mm:ss')
            });
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    socket.on('channel:join', joinChannel);
    socket.on('channel:create', createChannel);
    socket.on('channel:leave', leaveChannel);
    socket.on('channel:update', updateChannel);
    socket.on('channel:delete', deleteChannel);
    socket.on('channel:send', sendMessage);
};
