import { Socket } from 'socket.io';
import { io } from '../bin/www';
export const getSocketIp = (socket: Socket) => {
    return (
        (socket.handshake.headers['x-real-ip'] as string) ||
        socket.request.connection.remoteAddress ||
        ''
    );
};

export interface SocketOnlineMemberData {
    socketId: string,
    userId: string,
    status: string,
}

export const getOnlineMembersInRoom = (id: string): SocketOnlineMemberData[] => {
    const allActiveSockets = io.sockets.adapter.rooms.get(id);
    const onlineMembers: SocketOnlineMemberData[] = [];
    const allSockets = io.sockets.sockets;

    if (allActiveSockets) {
        allActiveSockets.forEach((s) => {
            for (let [socketId, socket] of allSockets) {
                if (socketId === s) {
                    onlineMembers.push({ socketId: socket.id, userId: socket.data.user, status: socket.data.status });
                }
            }
        })
    }

    return onlineMembers;
}