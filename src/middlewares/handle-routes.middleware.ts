import { getSocketIp } from './../utils/socket';
import { Socket } from 'socket.io';
import log from '../utils/logger';

function defaultCallback() {
    log('ERROR', 'Internal Socket Server Error');
}

export default function directRoute(socket: Socket, routes: Routes) {
    return async ([event, data, next = defaultCallback]: MiddlewareArgs) => {
        const route = routes[event];
        if (route) {
            try {
                const ctx: Context<any> = {
                    data,
                    socket: {
                        id: socket.id,
                        ip: getSocketIp(socket),
                        get user() {
                            return socket.data.user;
                        },
                        set user(newUserId: string) {
                            socket.data.user = newUserId;
                        },
                        get isAdmin() {
                            return socket.data.isAdmin;
                        },
                        join: socket.join.bind(socket),
                        leave: socket.leave.bind(socket),
                        emit: (target, _event, _data) => {
                            socket.to(target).emit(_event, _data);
                        }
                    }
                };
                const before = Date.now();
                const res = await route(ctx);
                const after = Date.now();
                log(
                    'INFO',
                    `[${event}]`,
                    after - before,
                    ctx.socket.id,
                    ctx.socket.user || 'null',
                    typeof res === 'string' ? res : 'null'
                );
                next(res);
            } catch (err: any) {
                if (err instanceof SocketEventError) {
                    next(`${err.code}: ${err.message}`);
                } else {
                    next(`Server Error: ${err.message}`);
                }
            }
        } else {
            next(`Server Error: event [${event}] not exists`);
        }
    };
}
