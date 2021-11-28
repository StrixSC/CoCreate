import { Action } from '.prisma/client';
import { db } from './../../../db';
import { DrawingState } from './../../../models/IAction.model';
import { SocketEventError } from '../../../socket';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from './../../../utils/errors';
import { Socket, Server } from 'socket.io';

export const handleRotation = async (io: Server, socket: Socket, data: Action) => {
    try {
        const state = data.state;
        if (state === DrawingState.Move || state === DrawingState.Down) {
            io.emit('rotation:received', { ...data });
        } else {
            const savedAction = await db.action.create({
                data: {
                    ...data,
                }
            });

            if (!savedAction) {
                throw new SocketEventError('Could not save action: Unexpected error has occurred.', ExceptionType.Drawing);
            }

            io.emit('rotation:received', {
                ...data
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing)
    }
}