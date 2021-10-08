import { StatusCodes, getStatusText } from 'http-status-codes';
import { IStdResponse } from '../models/IStdResponse.model';

const errors = {
    SERVER_ERROR: {
        error_code: 0,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
        friendly_message: "Oups! On dirait qu’il y a eu un petit problème chez le serveur, veuillez réessayer plus tard! Désolé pour l’inconvénient 😞"
    } as IStdResponse,

    INVALID_AUTH_INFO: {
        error_code: 1,
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid email or password.",
        friendly_message: "Oups! On dirait que les informations fournies ne sont pas valides. Vérifiez que vous avez bien utilisé les bonnes informations!"
    } as IStdResponse
}

export default errors;