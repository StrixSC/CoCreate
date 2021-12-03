import { Server, Socket } from 'socket.io';
import { handleDisconnect } from './handlers/collaborations/disconnect.handler';
import { handleLeave } from './handlers/collaborations/leave.handler';
import { handleConnect } from './handlers/collaborations/connect.handler';
import { handleUpdate } from './handlers/collaborations/update.handler';
import { handleJoin } from './handlers/collaborations/join.handler';
import { handleCreate } from './handlers/collaborations/create.handler';
import { handleDelete } from './handlers/collaborations/delete.handler';

export = (io: Server, socket: Socket) => {
    socket.on("collaboration:join", (io, socket, data: any) => handleJoin(io, socket, data));
    socket.on("collaboration:create", (io, socket, data: any) => handleCreate(io, socket, data));
    socket.on("collaboration:update", (io, socket, data: any) => handleUpdate(io, socket, data));
    socket.on("collaboration:delete", (io, socket, data: any) => handleDelete(io, socket, data));
    socket.on("collaboration:connect", (io, socket, data: any) => handleConnect(io, socket, data));
    socket.on("collaboration:leave", (io, socket, data: any) => handleLeave(io, socket, data));
    socket.on("collaboration:disconnect", (io, socket, data: any) => handleDisconnect(io, socket, data));
}