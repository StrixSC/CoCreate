import { StatusCodes } from 'http-status-codes';
import { IStdResponse } from '../models/IStdResponse.model';

const messages = {
    REGISTER_SUCCESS: {
        message: "Registration successful",
        status: StatusCodes.CREATED,
        friendly_message: "Inscription complétée avec succès!"
    } as IStdResponse,
}

export default messages;