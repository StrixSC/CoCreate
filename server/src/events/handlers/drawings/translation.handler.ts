import { handleSocketError } from './../../../utils/errors';
import { Action, ActionType } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { db } from "../../../db";
import { ExceptionType } from "../../../models/Exceptions.enum";
import { DrawingState } from "../../../models/IAction.model";
import { SocketEventError } from "../../../socket";
import { validateDrawingEvents } from "../../../utils/drawings";

export const handleTranslation = async (io: Server, socket: Socket, data: Action) => {
    try {
        const state = data.state;
        if ((state === DrawingState.Move || state === DrawingState.Down) && !data.isUndoRedo) {
            io.to(data.collaborationId).emit('translation:received', { ...data });
        } else {
            const savedAction = await db.action.create({
                data: {
                    ...data,
                }
            });

            if (!savedAction) {
                throw new SocketEventError('Could not save action: Unexpected error has occurred.', ExceptionType.Drawing);
            }

            io.to(data.collaborationId).emit('translation:received', {
                ...data
            });
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing);
    }
};