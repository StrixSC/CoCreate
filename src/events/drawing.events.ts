import { Server, Socket } from 'socket.io';
import log from '../utils/logger';

export = (io: Server, socket: Socket) => {
  const sendCoords = (data: { x: number; y: number; state: string; actionId: string }) => {
    log('INFO', `Socket Event Triggered: ${socket.id} moved to ${data.x}, ${data.y}`);
    io.emit('freedraw:receive', {
      x: data.x,
      y: data.y,
      state: data.state,
      actionId: data.actionId
    });
  };

  socket.on('freedraw:emit', sendCoords);
};
