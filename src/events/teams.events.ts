import { handleUpdate } from './handlers/teams/update.handler';
import { Server, Socket } from 'socket.io';
import { handleDelete } from './handlers/drawings/delete.handler';
import { handleCreate } from './handlers/teams/create.handler';
import { handleJoin } from './handlers/teams/join.handler';
import { handleLeave } from './handlers/teams/leave.handler';

export = (io: Server, socket: Socket) => {
    socket.on('teams:create', (data: any) => handleCreate(io, socket, data));
    socket.on('teams:update', (data: any) => handleUpdate(io, socket, data));
    socket.on('teams:join', (data: any) => handleJoin(io, socket, data));
    socket.on('teams:delete', (data: any) => handleDelete(io, socket, data));
    socket.on('teams:leave', (data: any) => handleLeave(io, socket, data));
};
