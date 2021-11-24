import { MemberType, Collaboration, CollaborationType, Drawing, Account, CollaborationMember, Profile, User } from '.prisma/client';
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
        console.log(data);
        const { filter, offset, limit, type } = data;

        let collaborations = await getCollaborations(filter, offset, limit, type) as (Collaboration & {
            drawing: Drawing | null;
            collaboration_members: (CollaborationMember & {
                user: User & {
                    profile: Profile | null;
                    account: Account | null;
                };
            })[];
        })[]

        if (collaborations.length <= 0) {
            return res.status(StatusCodes.NO_CONTENT).json([])
        }

        return res.status(StatusCodes.OK).json((collaborations).filter((c) => {
            if (type === CollaborationType.Private) {
                return (
                    c.type === type &&
                    c.collaboration_members.length === 1 &&
                    c.collaboration_members[0].user_id === req.userId &&
                    c.collaboration_members[0].type === MemberType.Owner
                )
            } else return true;
        }).map((c) => {
            const author = c.collaboration_members.find((m: any) => m.type === MemberType.Owner);
            if (!author) {
                return
            }

            return {
                collaboration_id: c.collaboration_id,
                title: c.drawing!.title,
                drawing_id: c.drawing!.drawing_id,
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