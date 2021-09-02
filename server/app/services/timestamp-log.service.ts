import { injectable } from 'inversify';

/// Service pour modifier le console log pour ajouter un timestamp au log
@injectable()
export class TimestampLogService {

    static WHITE = '\x1b[0m';
    static BLACK = '\x1b[30m';
    static RED = '\x1b[31m';
    static GREEN = '\x1b[32m';
    static YELLOW = '\x1b[33m';
    static BLUE = '\x1b[34m';
    static MAGENTA = '\x1b[35m';
    static CYAN = '\x1b[36m';
    static RESET = '\x1b[0m';
    static BRIGHT = '\x1b[1m';
    static DIM = '\x1b[2m';
    static UNDERSCORE = '\x1b[4m';
    static BLINK = '\x1b[5m';
    static REVERSE = '\x1b[7m';
    static HIDDEN = '\x1b[8m';

    private date: Date;
    constructor() {
        this.date = new Date();
    }

    /// Afficher a la console un message avec un timestamp
    log(message: any): void {
        message = String(message);
        this.date = new Date();
        console.log(`${this.date.toLocaleString()} : ${message}`);
    }

}
