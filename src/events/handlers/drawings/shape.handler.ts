import { Action } from '.prisma/client';
import { db } from './../../../db';
import { DrawingState } from './../../../models/IAction.model';
import { SocketEventError } from '../../../socket';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from './../../../utils/errors';
import { Socket, Server } from 'socket.io';

export const handleShape = async (io: Server, socket: Socket, data: Action) => {
    try {
        if (data.state === DrawingState.Down || data.state === DrawingState.Move) {
            io.emit('shape:received', {
                ...data,
                isSelected: !!data.isSelected,
            });
        } else if (data.state === DrawingState.Up) {
            const dbAction = await db.action.create({
                data: {
                    ...data,
                    isSelected: !!data.isSelected
                }
            });

            if (!dbAction) {
                throw new SocketEventError(
                    'Could not trigger the action: Internal Socket Server Error',
                    'E2102'
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

            io.emit('shape:received', {
                ...data,
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
};