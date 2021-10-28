import Debug from 'debug';
import chalk from 'chalk';
type DebugType = 'ERROR' | 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL' | 'DEBUG';
const debug = Debug('Colorimage');

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
}
