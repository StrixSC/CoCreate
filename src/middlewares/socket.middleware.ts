import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Socket } from 'socket.io';
import log from '../utils/logger';
import chalk from 'chalk';

export const logEvent = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
    return (event: any[], next: (err?: Error | undefined) => void) => {
        log(
            'DEBUG',
            'Socket event triggered:',
            chalk.black.bgWhite(event[0]),
            'from Socket',
            chalk.greenBright(socket.data.user || socket.id)
        );
        next();
    };
};
