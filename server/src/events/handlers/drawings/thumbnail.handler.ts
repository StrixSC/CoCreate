import { db } from './../../../db';
import { ExceptionType } from '../../../models/Exceptions.enum';
import { handleSocketError } from './../../../utils/errors';
import { Socket, Server } from 'socket.io';
export const handleThumbnail = async (io: Server, socket: Socket, data: { collaborationId: string, url: string }) => {
    try {
        const drawing = await db.drawing.updateMany({
            where: {
                collaboration_id: data.collaborationId,
            },
            data: {
                thumbnail_url: data.url,
            },
        });
        if (drawing) {
            io.emit('drawing:thumbnail:updated', {
                collaborationId: data.collaborationId,
                newUrl: data.url,
            })
        }
    } catch (e) {
        handleSocketError(socket, e, ExceptionType.Drawing)
    }
};