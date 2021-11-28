import { Action } from '.prisma/client';
import { db } from './../../../db';
import { DrawingState } from './../../../models/IAction.model';
import { SocketEventError } from '../../../socket';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from './../../../utils/errors';
import { Socket, Server } from 'socket.io';

export const handleResize = async (io: Server, socket: Socket, data: Action) => {
    try {
        const state = data.state;
        if (state === DrawingState.Move || state === DrawingState.Down) {
            return io.emit('resize:received', { ...data });
        } else {
            const savedAction = await db.action.create({
                data: {
                    ...data,
                }
            });

            if (!savedAction) {
                throw new SocketEventError('Could not save action: Unexpected error has occurred.', ExceptionType.Drawing);
            }

            return io.emit('resize:received', {
                ...data
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing)
    }
};