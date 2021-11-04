import Debug from 'debug';
import chalk from 'chalk';
type DebugType = 'ERROR' | 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL' | 'DEBUG';
const debug = Debug('Colorimage');

// Create a logger instance with Winston.
import winston from 'winston';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/combined.log' })
    ]
});

const colors: { [key: string]: (message?: any, ...optionalParams: any[]) => any } = {
    ERROR: chalk.bold.redBright,
    INFO: chalk.blueBright,
    WARNING: chalk.yellowBright,
    SUCCESS: chalk.greenBright,
    CRITICAL: chalk.whiteBright.bold.bgRed,
    DEBUG: chalk.whiteBright
};

export default function log(type: DebugType, ...messages: any[]) {
    debug(colors[type?.toString() || 'INFO'](`[${type || 'INFO'}]`, ...messages));
    logger.info(`[${type || 'INFO'}]`, ...messages);
}
