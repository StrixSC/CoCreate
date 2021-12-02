import { handleLeave } from './handlers/channels/leave.handler';
import { handleUpdate } from './handlers/channels/update.handler';
import { handleDelete } from './handlers/channels/delete.handler';
import { handleSend } from './handlers/channels/send.handler';
import { handleJoin } from './handlers/channels/join.handler';
import { handleCreate } from './handlers/channels/create.handler';
import { Server, Socket } from 'socket.io';

export = (io: Server, socket: Socket) => {
    socket.on('channel:join', (data) => handleJoin(io, socket, data));
    socket.on('channel:create', (data) => handleCreate(io, socket, data));
    socket.on('channel:leave', (data) => handleLeave(io, socket, data));
    socket.on('channel:update', (data) => handleUpdate(io, socket, data));
    socket.on('channel:delete', (data) => handleDelete(io, socket, data));
    socket.on('channel:send', (data) => handleSend(io, socket, data));
};
