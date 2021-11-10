import { StatusCodes } from 'http-status-codes';
import { handleRequestError } from './../utils/errors';
import { Request, Response, NextFunction } from 'express';
import { getDrawingsWithFilter } from '../services/gallery.service';

export const getGalleryController = async (req: Request<any>, res: Response<any>, next: NextFunction) => {
    try {
        const filter = req.query.filter || "";
        const offset = req.query.offset || 0;
        const limit = req.query.limit || 12;
        const drawings = await getDrawingsWithFilter(filter as string, offset as number, limit as number);

        if (!drawings) {
            return res.send(StatusCodes.NO_CONTENT).json(drawings);
        }

        return res.send(StatusCodes.OK).json(drawings);
    } catch (e) {
        handleRequestError(e, next);
    }
}