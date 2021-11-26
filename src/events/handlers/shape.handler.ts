import { Action } from "@prisma/client";
import { Server, Socket } from "socket.io"
import validator from "validator";
import { db } from "../../db";
import { ExceptionType } from "../../models/Exceptions.enum";
import { DrawingState } from "../../models/IAction.model";
import { SocketEventError } from "../../socket";
import { handleSocketError } from "../../utils/errors";

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

            socket.emit('action:saved', {
                collaborationId: dbAction.collaborationId,
                actionId: dbAction.actionId,
                userId: dbAction.userId,
                actionType: 'Save',
                username: dbAction.username,
                isUndoRedo: data.isUndoRedo
            });

            io.emit('shape:received', {
                ...data,
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
};