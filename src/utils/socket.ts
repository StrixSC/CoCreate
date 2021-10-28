import { Socket } from 'socket.io';
export const getSocketIp = (socket: Socket) => {
  return (
    (socket.handshake.headers['x-real-ip'] as string) ||
        socket.request.connection.remoteAddress ||
        ''
  );
};
