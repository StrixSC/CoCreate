import chalk from 'chalk';
import { debug } from 'console';
type DebugType = 'ERROR' | 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';

const colors: { [key: string]: (message?: any, ...optionalParams: any[]) => any } = {
    ERROR: chalk.redBright,
    INFO: chalk.blueBright,
    WARNING: chalk.yellowBright,
    SUCCESS: chalk.greenBright,
    CRITICAL: chalk.bgRedBright
};

export default function log(type: DebugType, ...messages: any[]) {
    debug(`[${type || 'INFO'}]::${colors[type?.toString() || 'INFO'](...messages)}`);
}
