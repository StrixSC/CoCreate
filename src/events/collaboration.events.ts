import { Server, Socket } from 'socket.io';
import { handleDisconnect } from './handlers/collaborations/disconnect.handler';
import { handleLeave } from './handlers/collaborations/leave.handler';
import { handleConnect } from './handlers/collaborations/connect.handler';
import { handleUpdate } from './handlers/collaborations/update.handler';
import { handleJoin } from './handlers/collaborations/join.handler';
import { handleCreate } from './handlers/collaborations/create.handler';
import { handleDelete } from './handlers/collaborations/delete.handler';

export = (io: Server, socket: Socket) => {
    socket.on("collaboration:join", (data: any) => handleJoin(io, socket, data));
    socket.on("collaboration:create", (data: any) => handleCreate(io, socket, data));
    socket.on("collaboration:update", (data: any) => handleUpdate(io, socket, data));
    socket.on("collaboration:delete", (data: any) => handleDelete(io, socket, data));
    socket.on("collaboration:connect", (data: any) => handleConnect(io, socket, data));
    socket.on("collaboration:leave", (data: any) => handleLeave(io, socket, data));
    socket.on("collaboration:disconnect", (data: any) => handleDisconnect(io, socket, data));
}