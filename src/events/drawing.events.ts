import chalk from 'chalk';
import { Server, Socket } from 'socket.io';

export = (io: Server, socket: Socket) => {
    console.log(chalk.greenBright('[INFO]::Socket Event Triggered::'));
    //const userId = (socket as any).request.session.passport.user;

    const sendCoords = (coords: { x: number; y: number; state: string }) => {
        console.log(`${socket.id} moved to ${coords.x}, ${coords.y}`);
        io.emit('freedraw:receive', {
            x: coords.x,
            y: coords.y,
            state: coords.state // down, move, up
        });
    };

    socket.on('freedraw:emit', sendCoords);
};
