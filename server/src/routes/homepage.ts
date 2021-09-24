import { Request, Response } from 'express';
import * as Constants from '../constants/responses';



export const WelcomeMessage = (req: Request, res: Response) => {
    res.status(Constants.OK).send({
        'message': 'New Welcome Message!'
    })
}