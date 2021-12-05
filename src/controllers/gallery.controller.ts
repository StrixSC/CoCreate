import { getOnlineMembersInRoom } from './../utils/socket';
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
        const { filter, offset, limit, type } = data;

        let result = await getCollaborations(filter, offset, limit, type, req.userId, true);

        if (result.collaborations.length <= 0) {
            return res.status(StatusCodes.OK).json({
                drawings: [],
                offset: result.offset,
                limit: result.limit,
                total_drawing_count: result.total
            })
        }
        const returnArray = result.collaborations.map((c) => {
            const authorUsername = c.author.is_team ? c.author.team!.team_name : c.author.user!.profile!.username;
            const authorAvatarUrl = c.author.is_team ? c.author.team!.avatar_url : c.author.user!.profile!.avatar_url;
            const isOwner =
                c.author.is_team
                    ? c.author.team?.team_members.find((tm) => tm.user_id === req.userId) ? true : false
                    : c.author.user_id === req.userId;
            const isMember = c.collaboration_members.find((m: any) => m.user_id === req.userId);
            const isTeam = c.author.is_team ? true : false;

            const onlineMembers = getOnlineMembersInRoom(c.collaboration_id);
            return {
                collaboration_id: c.collaboration_id,
                title: c.drawing!.title,
                drawing_id: c.drawing!.drawing_id,
                created_at: c.created_at,
                updated_at: c.updated_at,
                author_username: isTeam ? `Équipe ${authorUsername}` : authorUsername,
                author_avatar: authorAvatarUrl,
                thumbnail_url: c.drawing!.thumbnail_url,
                type: c.type,
                collaborator_count: c.collaboration_members.length,
                active_collaborator_count: onlineMembers.length,
                is_member: isMember ? true : false,
                is_owner: isOwner ? true : false,
                is_team: isTeam ? true : false,
            }
        })
        return res.status(StatusCodes.OK).json({ drawings: returnArray, total_drawing_count: result.total, offset: result.offset, limit: result.limit });
    } catch (e) {
        handleRequestError(e, next);
    }
};

export const getMyGalleryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const { filter, offset, limit, type } = data;
        let result = await getCollaborations(filter, offset, limit, type, req.userId, false);

        if (result.collaborations.length <= 0) {
            return res.status(StatusCodes.OK).json({
                drawings: [],
                offset: result.offset,
                limit: result.limit,
                total_drawing_count: result.total
            })
        }

        const returnArray = result.collaborations.map((c) => {
            const authorUsername = c.author.is_team ? c.author.team!.team_name : c.author.user!.profile!.username;
            const authorAvatarUrl = c.author.is_team ? c.author.team!.avatar_url : c.author.user!.profile!.avatar_url;
            const isOwner =
                c.author.is_team
                    ? c.author.team?.team_members.find((tm) => tm.user_id === req.userId) ? true : false
                    : c.author.user_id === req.userId;
            const isMember = c.collaboration_members.find((m: any) => m.user_id === req.userId);
            const isTeam = c.author.is_team ? true : false;
            const onlineMembers = getOnlineMembersInRoom(c.collaboration_id);

            return {
                collaboration_id: c.collaboration_id,
                title: c.drawing!.title,
                drawing_id: c.drawing!.drawing_id,
                thumbnailUrl: c.drawing!.thumbnail_url,
                created_at: c.created_at,
                updated_at: c.updated_at,
                author_username: isTeam ? `Équipe ${authorUsername}` : authorUsername,
                author_avatar: authorAvatarUrl,
                type: c.type,
                collaborator_count: c.collaboration_members.length,
                active_collaborator_count: onlineMembers.length,
                is_member: isMember ? true : false,
                is_owner: isOwner ? true : false,
                is_team: isTeam ? true : false
            }
        })
        return res.status(StatusCodes.OK).json({ drawings: returnArray, total_drawing_count: result.total, offset: result.offset, limit: result.limit });
    } catch (e) {
        handleRequestError(e, next);
    }
};