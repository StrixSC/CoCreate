import { Server, Socket } from 'socket.io';
import { CollaborationType } from '.prisma/client';
export = (io: Server, socket: Socket) => {
    const onJoinCollaboration = (payload: {
        userId: string,
        collaborationId: string,
        type: string,
        password?: string,
    }): Promise<void> => {
        return Promise.resolve();
    }

    const onCreateCollaboration = (payload: {
        userId: string,
        title: string,
        type: CollaborationType,
        password?: string
    }): Promise<void> => {
        return Promise.resolve();
    }

    const onDeleteCollaboration = (payload: {
        userId: string,
        collaborationdId: string,
    }): Promise<void> => {
        return Promise.resolve();
    }

    const onUpdateCollaboration = (payload: {
        userId: string,
        title?: string,
        type?: string,
        password?: string,
    }): Promise<void> => {
        return Promise.resolve();
    }

    socket.on("collaboration:join", onJoinCollaboration);
    socket.on("collaboration:create", onCreateCollaboration);
    socket.on("collaboration:update", onUpdateCollaboration);
    socket.on("collaboration:delete", onCreateCollaboration);
}