import { MemberType } from '.prisma/client';
import { validationResult, matchedData } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { handleRequestError } from './../utils/errors';
import { Request, Response, NextFunction } from 'express';
import { getDrawings } from '../services/gallery.service';

export const getGalleryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const { filter, offset, limit } = data;

        const drawings = await getDrawings(filter, offset, limit);

        if (drawings.length <= 0) {
            return res.status(StatusCodes.NO_CONTENT).json([])
        }

        return res.status(StatusCodes.OK).json((drawings.map((d) => ({
            collaboration_id: d.collaboration_id,
            drawing_id: d.drawing_id,
            created_at: d.collaboration.created_at,
            updated_at: d.collaboration.updated_at,
            author_username: d.collaboration.collaboration_members.find((m: any) => m.type === MemberType.Owner)?.user.profile?.username || null,
            author_avatar: d.collaboration.collaboration_members.find((m: any) => m.type === MemberType.Owner)?.user.profile?.avatar_url || null,
            title: d.title,
            type: d.collaboration.type,
            collaborator_count: d.collaboration.collaboration_members.length,
            max_collaborator_count: d.collaboration.max_collaborator_count
        }))));
    } catch (e) {
        handleRequestError(e, next);
    }
};