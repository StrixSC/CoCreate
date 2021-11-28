import { Server, Socket } from 'socket.io';
import { handleCreate } from './handlers/teams/create.handler'
export = (io: Server, socket: Socket) => {
    socket.on('teams:create', (data: any) => handleCreate(io, socket, data));
    socket.on('teams:update', () => { });
    socket.on('teams:join', () => { });
    socket.on('teams:delete', () => { });
    socket.on('teams:leave', () => { });
    socket.on('teams:fetch', () => { });
};
