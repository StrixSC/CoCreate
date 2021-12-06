import { LogType } from '.prisma/client';
import { db } from './../db';
import { handleSocketError } from './../utils/errors';
import { SocketEventError } from './../socket';
import { Server, Socket } from 'socket.io';
import { ExceptionType } from '../models/Exceptions.enum';

export = (io: Server, socket: Socket) => {
    socket.on('log:drawing-action', async (data: { collaborationId: string }) => {
        try {
            const collaborationId = data.collaborationId;
            if (!collaborationId) {
                throw new SocketEventError("Erreur, nous n'avons pas pu enregistrer l'entrée à l'historique, il n'y a pas d'identifiant de fournit pour la collaboration accédée...", "E1291");
            }

            const log = await db.log.create({
                data: {
                    type: LogType.DrawingUpdate,
                    user_id: socket.data.user,
                    collaboration_id: collaborationId
                },
            });

            if (!log) {
                throw new SocketEventError("Erreur: Nous n'avons pas pu enregistrer l'entrée à l'historique, une erreur imprévue s'est produite lors du traitement de la requête...", "E1289")
            }

            socket.emit("log:saved");
        } catch (e) {
            handleSocketError(socket, e, undefined, [ExceptionType.Logs_Drawing]);
        }
    });
};
