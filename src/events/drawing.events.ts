import { db } from './../db';
import { SocketEventError } from './../socket';
import { handleSocketError } from './../utils/errors';
import { Server, Socket } from 'socket.io';
import { validateDrawingEvents } from './../utils/drawings';
import { ActionType, Action } from '@prisma/client';
import validator from 'validator';
import log from '../utils/logger';

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

            if (data.state === 'up') {
                const dbAction = await db.action.create({
                    data: {
                        actionType: data.actionType,
                        userId: data.userId || 'DEMO',
                        username: data.username,
                        collaborationId: 'DEMO_COLLABORATION',
                        actionId: data.actionId,
                        a: data.a,
                        r: data.r,
                        g: data.g,
                        b: data.b,
                        width: data.width,
                        isSelected:
                            typeof data.isSelected === 'string'
                                ? validator.toBoolean(data.isSelected)
                                : data.isSelected,
                        offsets: JSON.stringify(data.offsets),
                        state: data.state
                    }
                });

                if (!dbAction) {
                    throw new SocketEventError(
                        'Could not trigger the action: Internal Socket Server Error',
                        'E2002'
                    );
                }

                socket.emit('action:saved', {
                    collaborationId: dbAction.collaborationId,
                    actionId: dbAction.actionId
                });

                return io.emit('freedraw:received', {
                    actionId: dbAction.actionId,
                    username: dbAction.username,
                    userId: dbAction.userId,
                    actionType: dbAction.actionType,
                    state: dbAction.state,
                    isSelected: dbAction.isSelected,
                    offsets: JSON.stringify(dbAction.offsets),
                    r: dbAction.r,
                    g: dbAction.g,
                    b: dbAction.b,
                    a: dbAction.a,
                    width: dbAction.width,
                    collaborationId: dbAction.collaborationId,
                    timestamp: dbAction.createdAt
                });
            }

            // TODO: Collaboration rooms. io.to(collaborationId).emit('freedraw:received', {});
            io.emit('freedraw:received', {
                actionType: data.actionType,
                userId: data.userId || 'DEMO',
                username: data.username,
                collaborationId: 'DEMO_COLLABORATION',
                actionId: data.actionId,
                a: data.a,
                r: data.r,
                g: data.g,
                b: data.b,
                x: data.x,
                y: data.y,
                width: data.width,
                isSelected:
                    typeof data.isSelected === 'string'
                        ? validator.toBoolean(data.isSelected)
                        : data.isSelected,
                state: data.state
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

    const onSelection = async (data: Action) => {
        try {
            const validated = validateDrawingEvents(ActionType.Select, data);
            if (!validated.result) {
                throw new SocketEventError(
                    `Could not trigger action: Selection data error on: ${validated.field}`,
                    'E2201'
                );
            }

            const action = await db.action.findFirst({
                where: {
                    actionId: data.actionId,
                    collaborationId: data.collaborationId
                }
            });

            if (!action) {
                throw new SocketEventError(
                    'Could not trigger action: Action could not be found in the database',
                    'E2202'
                );
            }

            if (action.isSelected && action.selectedBy !== action.userId) {
                throw new SocketEventError(
                    'Could not trigger action: The action is already selected by a different user.',
                    'E2203'
                );
            }

            const userSelectionChoice =
                typeof data.isSelected === 'string'
                    ? validator.toBoolean(data.isSelected)
                    : data.isSelected;

            const selectedByUser = userSelectionChoice ? data.userId : '';

            const updatedAction = await db.action.updateMany({
                where: {
                    actionId: action.actionId
                },
                data: {
                    selectedBy: selectedByUser,
                    isSelected: userSelectionChoice
                }
            });

            if (updatedAction.count === 0) {
                throw new SocketEventError(
                    'Could not trigger action. Either the isSelected value does not differ from the one currently applied or there was an unexpected socket server error.',
                    'E2204'
                );
            }

            io.emit('selection:received', {
                actionId: action.actionId,
                isSelected: userSelectionChoice,
                selectedBy: selectedByUser
            });
        } catch (e: any) {
            handleSocketError(socket, e);
        }
    };

    socket.on('freedraw:emit', onFreedraw);
    socket.on('shape:emit', onShapeDraw);
    socket.on('selection:emit', onSelection);
};
