import { DrawingState } from './../../../models/IAction.model';
import { SocketEventError } from './../../../socket';
import { db } from '../../../db';
import { handleSocketError } from '../../../utils/errors';
import { Action } from '.prisma/client';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../../../models/Exceptions.enum';

export const handleFreedraw = async (io: Server, socket: Socket, data: Action) => {
    try {
        if (data.state === DrawingState.Up) {
            const dbAction = await db.action.create({
                data: {
                    ...data,
                    offsets: JSON.stringify(data.offsets),
                    isSelected: !!data.isSelected
                }
            });

            if (!dbAction) {
                throw new SocketEventError(
                    'Could not trigger the action: Internal Socket Server Error',
                    'E2002'
                );
            }

            if (!data.isUndoRedo) {
                socket.emit('action:saved', {
                    collaborationId: dbAction.collaborationId,
                    actionId: dbAction.actionId,
                    userId: dbAction.userId,
                    actionType: 'Save',
                    username: dbAction.username,
                    isUndoRedo: data.isUndoRedo
                });
            }

            return io.emit('freedraw:received', {
                ...data,
            });
        } else {
            io.emit('freedraw:received', {
                ...data,
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
};