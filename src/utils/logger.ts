import Debug from 'debug';
import chalk from 'chalk';
type DebugType = 'ERROR' | 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';
const debug = Debug('Colorimage');

const colors: { [key: string]: (message?: any, ...optionalParams: any[]) => any } = {
    ERROR: chalk.redBright,
    INFO: chalk.blueBright,
    WARNING: chalk.yellowBright,
    SUCCESS: chalk.greenBright,
    CRITICAL: chalk.bgRedBright
};

export default function log(type: DebugType, ...messages: any[]) {
    debug(colors[type?.toString() || 'INFO'](`[${type || 'INFO'}]`, ...messages));
}
