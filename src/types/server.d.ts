declare interface Context<T> {
    data: T;
    socket: {
        id: string;
        ip: string;
        isAdmin: boolean;
        user: string;
        join: (room: string) => void;
        leave: (room: string) => void;
        emit: (target: string[] | string, event: string, data: any) => void;
    };
}

declare class SocketEventError extends Error {
    code: string;
    message: string;
    status?: string;

    constructor(
        message?: string = 'Internal Server Error',
        code?: string = 'E0000',
        status?: string = null
    ) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}

declare interface RouteHandler {
    (ctx: Context<any>): string | any;
}

declare type Routes = Record<string, RouteHandler | null>;

declare type MiddlewareArgs = Array<any>;

declare type MiddlewareNext = () => void;
