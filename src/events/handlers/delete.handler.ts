import { db } from './../../db';
import { handleSocketError } from './../../utils/errors';
import { Action } from '.prisma/client';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../../models/Exceptions.enum';
export const handleDelete = async (io: Server, socket: Socket, data: Action) => {
    try {
        const dbAction = await db.action.create({
            data: {
                ...data,
                isSelected: !!data.isSelected,
                isUndoRedo: !!data.isUndoRedo,
            }
        });

        io.emit('delete:received', {
            ...data
        } as Action);
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
}