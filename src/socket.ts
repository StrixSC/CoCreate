export interface Context<T> {
    data: T;
    socket: {
        id: string;
        ip: string;
        isAdmin: boolean;
        user: string;
        join: (room: string) => void;
        leave: (room: string) => void;
        emit: (
            target: string[] | string,
            event: string,
            data: any
        ) => void;
    };
}

export class SocketEventError extends Error {
    code: string;
    message: string;
    status: string | null;

    constructor(
        message = 'Oups... Une erreur imprévu s\'',
        code = 'E0000',
        status: string | null = null
    ) {
        super();
        this.code = code;
        this.message = message;
        this.status = status;
    }
}

export interface RouteHandler {
    (ctx: Context<any>): string | any;
}

export type Routes = Record<
    string,
    RouteHandler | null
>;

export type MiddlewareArgs = Array<any>;

export type MiddlewareNext = () => void;
