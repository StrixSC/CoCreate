import { MemberType, Collaboration, CollaborationType } from '.prisma/client';
import { validationResult, matchedData } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { handleRequestError } from './../utils/errors';
import { Request, Response, NextFunction } from 'express';
import { getCollaborations } from '../services/gallery.service';

export const getGalleryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const { filter, offset, limit, type } = data;

        const collaborations = await getCollaborations(filter, offset, limit, type);

        if (collaborations.length <= 0) {
            return res.status(StatusCodes.NO_CONTENT).json([])
        }

        return res.status(StatusCodes.OK).json((collaborations).filter((c) => {
            const author = c.collaboration_members.find((m: any) => m.type === MemberType.Owner);
            if (!author) {
                return false
            }

            if (type === CollaborationType.Private) {
                return author.user.userId === req.userId;
            } else return true;
        }).map((c) => {
            const author = c.collaboration_members.find((m: any) => m.type === MemberType.Owner);
            if (!author) {
                return
            }

            return {
                collaboration_id: c.collaboration_id,
                title: c.drawing.title,
                drawing_id: c.drawing.drawing_id,
                created_at: c.created_at,
                updated_at: c.updated_at,
                author_username: author.user.profile!.username,
                author_avatar: author.user.profile!.avatar_url,
                type: c.type,
                collaborator_count: c.collaboration_members.length,
                max_collaborator_count: c.max_collaborator_count
            }
        }));
    } catch (e) {
        handleRequestError(e, next);
    }
};