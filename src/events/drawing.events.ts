import chalk from 'chalk';
import { debug } from 'console';
import { Server, Socket } from 'socket.io';

export = (io: Server, socket: Socket) => {
    const sendCoords = (data: { x: number; y: number; state: string; actionId: string }) => {
        debug(chalk.blueBright(`[SOCKET_TESTING]::${socket.id} moved to ${data.x}, ${data.y}`));
        io.emit('freedraw:receive', {
            x: data.x,
            y: data.y,
            state: data.state, // down, move, up
            actionId: data.actionId
        });
    };

    socket.on('freedraw:emit', sendCoords);
};
