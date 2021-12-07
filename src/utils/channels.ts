import validator from "validator";
import { SocketEventError } from "../socket";

export const validateChannelId = (channelId: string) => {
    if (!channelId || validator.isEmpty(channelId)) {
        throw new SocketEventError('Oups! On dirait que les informations entrée ne sont pas valides...', 'E1001');
    }
};

export const validateChannelName = (channelName: string) => {
    if (
        validator.isEmpty(channelName) ||
        !validator.isLength(channelName, {
            min: 4,
            max: 256
        })
    ) {
        throw new SocketEventError('Hmm... On dirait que le nom de la chaîne ne correspond pas aux exigences!', 'E1006');
    }
};

export const validateMessage = (message: string) => {
    if (
        validator.isEmpty(message) ||
        !validator.isLength(message, {
            min: 1,
            max: 256
        })
    ) {
        throw new SocketEventError('On dirait que le message est trop long...', 'E1018');
    }
};