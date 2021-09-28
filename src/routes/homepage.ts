import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export const WelcomeMessage = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).send({
        'message': 'Test Message!'
    })
}