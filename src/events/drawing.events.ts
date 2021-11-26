import { Server, Socket } from 'socket.io';
import { Action } from '@prisma/client';
import { handleTranslation } from './handlers/translation.handler';
import { handleShape } from './handlers/shape.handler';
import { handleFreedraw } from "./handlers/freedraw.handler"
import { handleSelection } from "./handlers/selection.handler"
import { handleRotation } from "./handlers/rotation.handler"
import { handleResize } from "./handlers/resize.handler";

export = (io: Server, socket: Socket) => {
    const onFreedraw = async (data: Action) => handleFreedraw(io, socket, data);
    const onShapeDraw = async (data: Action) => handleShape(io, socket, data);
    const onSelection = async (data: Action) => handleSelection(io, socket, data);
    const onTranslation = async (data: Action) => handleTranslation(io, socket, data);
    const onRotation = async (data: Action) => handleRotation(io, socket, data);
    const onResize = async (data: Action) => handleResize(io, socket, data);

    const onUndo = async (data: Action) => {
        io.emit('undoredo:received', {
            ...data
        } as Action);
    };

    const onDelete = async (data: Action) => {
        io.emit('delete:received', {
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