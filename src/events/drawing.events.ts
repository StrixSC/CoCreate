import { db } from './../db';
import { SocketEventError } from './../socket';
import { handleSocketError } from './../utils/errors';
import { Server, Socket } from 'socket.io';
import { validateDrawingEvents } from './../utils/drawings';
import { ActionType, Action } from '@prisma/client';
import validator from 'validator';

export = (io: Server, socket: Socket) => {
    const onFreedraw = async (data: Action) => {
        try {
            const validated = validateDrawingEvents(ActionType.Freedraw, data);
            if (!validated.result) {
                throw new SocketEventError(
                    `Could not trigger action: Freedraw data error on: ${validated.field}`,
                    'E2001'
                );
            }

            const dbAction = await db.action.create({
                data: {
                    actionType: data.actionType,
                    userId: socket.data.user || 'DEMO',
                    username: data.username,
                    collaborationId: 'DEMO_COLLABORATION',
                    actionId: data.actionId,
                    color: data.color,
                    x: data.x,
                    y: data.y,
                    width: data.width,
                    isSelected: validator.toBoolean(data.isSelected as unknown as string),
                    state: data.state
                }
            });

            if (!dbAction) {
                throw new SocketEventError(
                    'Could not emit the action: Internal Socket Server Error',
                    'E2002'
                );
            }

            // TODO: Collaboration rooms. io.to(collaborationId).emit('freedraw:received', {});
            io.emit('freedraw:received', {
                actionId: dbAction.actionId,
                username: dbAction.username,
                userId: dbAction.userId,
                actionType: dbAction.actionType,
                state: dbAction.state,
                isSelected: dbAction.isSelected,
                x: dbAction.x,
                y: dbAction.y,
                color: dbAction.color,
                width: dbAction.width,
                collaborationId: dbAction.collaborationId,
                timestamp: dbAction.createdAt
            });
        } catch (e) {
            handleSocketError(socket, e);
        }
    };

    const onShapeDraw = (data: Action) => {
        io.emit('shape:received', {
            ...data
        } as Action);
    };

    socket.on('freedraw:emit', onFreedraw);
    socket.on('shape:emit', onShapeDraw);
};
