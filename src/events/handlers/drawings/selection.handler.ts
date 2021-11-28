import { ActionType } from '@prisma/client';
import { Action } from '.prisma/client';
import { db } from './../../../db';
import { SocketEventError } from '../../../socket';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from './../../../utils/errors';
import { Socket, Server } from 'socket.io';

export const handleSelection = async (io: Server, socket: Socket, data: Action) => {
    try {
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

        const userSelectionChoice = !!data.isSelected;

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
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
}