import { IFreedrawAction, IShapeAction } from './../models/IAction.model';
import { Server, Socket } from 'socket.io';

export = (io: Server, socket: Socket) => {
    const onFreedraw = (data: IFreedrawAction) => {
        io.emit('freedraw:receive', {
            ...data
        } as IFreedrawAction);
    };

    const onShapeDraw = (data: IShapeAction) => {
        io.emit('shape:receive', {
            ...data
        } as IShapeAction);
    };

    socket.on('freedraw:emit', onFreedraw);
    socket.on('shape:emit', onShapeDraw);
};
