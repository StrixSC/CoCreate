import { StatusCodes } from 'http-status-codes';
import create from 'http-errors';
import { db } from './../db';
import { handleRequestError } from './../utils/errors';
import { Router } from 'express';

const router = Router();

router.get('/avatars', async (req, res, next) => {
    try {
        const avatars = await db.avatar.findMany({
            where: {
                isPublic: true
            }
        });

        if (!avatars) {
            throw new create.InternalServerError('Could not fetch public avatars');
        }

        if (avatars.length <= 0) {
            res.status(StatusCodes.NO_CONTENT).json({ avatars: [] });
        } else {
            res.status(StatusCodes.OK).json({ avatars: avatars.map((a) => a.avatar_url) });
        }
    } catch (e) {
        handleRequestError(e, next);
    }
});

export default router;
