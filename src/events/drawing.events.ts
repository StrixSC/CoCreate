import { DrawingState, IShapeAction } from './../models/IAction.model';
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
                        collaborationId: data.collaborationId, 
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
                        state: data.state,
                        selectedBy: '',
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
                    actionId: dbAction.actionId,
                    userId: dbAction.userId,
                    actionType: 'Save',
                    username: dbAction.username
                });

                return io.emit('freedraw:received', {
                    actionId: dbAction.actionId,
                    username: dbAction.username,
                    userId: dbAction.userId,
                    actionType: dbAction.actionType,
                    state: dbAction.state,
                    isSelected: dbAction.isSelected,
                    offsets: dbAction.offsets,
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
                collaborationId: data.collaborationId, 
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

    const onShapeDraw = async (data: Action) => {
        try {
            if (data.state === DrawingState.Down || data.state === DrawingState.Move) {
                io.emit('shape:received', {
                    ...data,
                    isSelected: (typeof data.isSelected === 'string' ? validator.toBoolean(data.isSelected) : data.isSelected),
                });
            } else if (data.state === DrawingState.Up) {
                const dbAction = await db.action.create({
                    data: {
                        ...data,
                        isSelected: (typeof data.isSelected === 'string' ? validator.toBoolean(data.isSelected) : data.isSelected),
                    }
                });

                if (!dbAction) {
                    throw new SocketEventError(
                        'Could not trigger the action: Internal Socket Server Error',
                        'E2102'
                    );
                }

                socket.emit('action:saved', {
                    collaborationId: dbAction.collaborationId,
                    actionId: dbAction.actionId,
                    userId: dbAction.userId,
                    actionType: 'Save',
                    username: dbAction.username
                });

                io.emit('shape:received', {
                    ...dbAction,
                });
            }
        } catch (e) {
            handleSocketError(socket, e);
        }
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

            if (action.isSelected && action.selectedBy !== data.userId) {
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
                selectedBy: selectedByUser,
                actionType: ActionType.Select,
                username: data.username,
                userId: action.userId,
                collaborationId: action.collaborationId,
            });
        } catch (e: any) {
            handleSocketError(socket, e);
        }
    };

    const onUndo = async (data: Action) => {
        io.emit('undoredo:received', {
            ...data
        } as Action);
    };

    const onTranslation = async (data: Action) => {
        io.emit('translation:received', {
            ...data
        } as Action);
    };

    const onRotation = async (data: Action) => {
        io.emit('rotation:received', {
            ...data
        } as Action);
    };

    const onDelete = async (data: Action) => {
        io.emit('delete:received', {
            ...data
        } as Action);
    };

    const onResize = async (data: Action) => {
        io.emit('resize:received', {
            ...data
        } as Action);
    };

    const onText = async (data: Action) => {
        io.emit('text:received', {
            ...data
        } as Action);
    };

    const onLayer = async (data: Action) => {
        io.emit('layer:received', {
            ...data
        } as Action);
    };

    socket.on('freedraw:emit', onFreedraw);
    socket.on('shape:emit', onShapeDraw);
    socket.on('selection:emit', onSelection);
    socket.on('undoredo:emit', onUndo);
    socket.on('translation:emit', onTranslation);
    socket.on('rotation:emit', onRotation);
    socket.on('delete:emit', onDelete);
    socket.on('layer:emit', onLayer);
    socket.on('resize:emit', onResize);
    socket.on('text:emit', onText);
};
