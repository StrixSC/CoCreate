import { StatusCodes, getStatusText } from 'http-status-codes';
import { IStdResponse } from '../models/IStdResponse.model';

const errors = {
  SERVER_ERROR: {
    errorCode: 0,
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
    friendlyMessage: 'Oups! On dirait qu’il y a eu un petit problème chez le serveur, veuillez réessayer plus tard! Désolé pour l’inconvénient 😞'
  } as IStdResponse,

  INVALID_AUTH_INFO: {
    errorCode: 1,
    status: StatusCodes.BAD_REQUEST,
    message: 'Invalid email or password.',
    friendlyMessage: 'Oups! On dirait que les informations fournies ne sont pas valides. Vérifiez que vous avez bien utilisé les bonnes informations!'
  } as IStdResponse,

  EMAIL_ALREADY_IN_USE: {
    errorCode: 2,
    status: StatusCodes.CONFLICT,
    message: 'Email already in use',
    friendlyMessage: 'Oups! On dirait que ce courriel est déjà utlisé, choisissez-en un autre!'
  } as IStdResponse,

  USER_UNAUTHORIZED: {
    error_code: 3,
    status: StatusCodes.UNAUTHORIZED,
    message: 'Unauthorized',
    friendlyMessage: 'Oups! Nous n\'avons trouvé aucun utilisateur avec ces informations. Assurez-vous que vous avez les bonnes informations!'
  } as IStdResponse
};

export default errors;