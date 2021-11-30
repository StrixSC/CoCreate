import { getTeamDrawings } from './../services/teams.service';
import create, { Unauthorized } from 'http-errors';
import { findTeamById } from './../events/handlers/teams/join.handler';
import { Collaboration, CollaborationMember, Drawing, MemberType } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { io } from '../bin/www';
import { getTeams } from '../services/teams.service';
import { DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT } from '../utils/drawings';
import { GetTeamsPayload, TeamResponse } from './../models/Teams.model';
import { handleRequestError } from './../utils/errors';
import { getOnlineMembersInRoom } from '../utils/socket';

export const getTeamsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const payload = {
            userId: req.userId,
            filter: data.filter,
            offset: data.offset,
            limit: data.limit,
            removeFull: data.removeFull,
            amOwner: data.amOwner,
            amMember: data.amMember,
            type: data.type
        } as GetTeamsPayload;

        if (!payload.offset) {
            payload.offset = DEFAULT_DRAWING_OFFSET;
        }

        if (!payload.limit) {
            payload.limit = DEFAULT_DRAWING_LIMIT;
        }

        const result = await getTeams(payload);

        return res.status(StatusCodes.OK).json({
            teams: result.teams.map((d) => {
                const author = d.team_members.find((tm) => (tm.type === MemberType.Owner));

                if (!author) {
                    return;
                };

                const isMember = d.team_members.find((tm) => tm.user_id === req.userId);
                const isOwner = d.team_members.find((tm) => tm.user_id === req.userId && tm.type === MemberType.Owner);
                const onlineMembers = getOnlineMembersInRoom(d.team_id);
                return {
                    authorUsername: author.user.profile!.username,
                    authorAvatarUrl: author.user.profile!.avatar_url,
                    avatarUrl: d.avatar_url,
                    bio: d.bio,
                    createdAt: d.created_at.toISOString(),
                    maxMemberCount: d.max_member_count,
                    teamId: d.team_id,
                    type: d.type,
                    mascot: d.mascot,
                    currentMemberCount: d.team_members.length,
                    teamName: d.team_name,
                    teamMembers: d.team_members.map((t) => ({ username: t.user.profile?.username, avatarUrl: t.user.profile!.avatar_url, type: t.type })),
                    isMember: isMember ? true : false,
                    isOwner: isOwner ? true : false,
                    onlineMemberCount: onlineMembers.length
                } as TeamResponse
            }),
            offset: result.offset,
            limit: result.limit,
            total: result.total
        })
    } catch (e) {
        handleRequestError(e, next);
    }
}

export const getTeamInfoById = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const errors = validationResult(req).array();

        if (errors.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['params'] });
        const teamId = data.id;
        const userId = req.userId;

        const team = await findTeamById(teamId);

        if (!team) {
            throw new create.Unauthorized("L'utilisateur ne fait pas partie de cette équipe. Accès non-autorisée");
        }

        const author = team.team_members.find((a) => a.type === MemberType.Owner);

        if (!author) {
            throw new create.InternalServerError('Erreur lors du traitement de la requête');
        }

        const onlineMembers = getOnlineMembersInRoom(teamId);
        const teamMembers = team.team_members.map((tm) => {
            let status = 'Hors-ligne';
            const member = onlineMembers.find((m) => m.userId === tm.user_id);

            if (member) {
                status = member.status;
            }

            return {
                username: tm.user.profile!.username,
                avatarUrl: tm.user.profile!.avatar_url,
                status: status,
                type: tm.type,
                joinedOn: tm.created_at
            }
        });

        const drawings = await getTeamDrawings(teamId);
        let allDrawings = [] as any | (Collaboration & {
            drawing: Drawing | null;
            collaboration_members: CollaborationMember[];
        })[];

        if (drawings) {
            allDrawings = drawings.collaborations.map((d) => {
                const onlineMembers = getOnlineMembersInRoom(d.collaboration_id);
                return {
                    currentCollaboratorCount: d.collaboration_members.length,
                    title: d.drawing!.title,
                    thumbnailUrl: d.drawing!.thumbnail_url,
                    activeCollaboratorCount: onlineMembers.length,
                    collaborationId: d.collaboration_id,
                    drawingId: d.drawing!.drawing_id
                }
            });
        }

        res.status(StatusCodes.OK).json({
            members: teamMembers,
            drawings: allDrawings
        });
    } catch (e) {
        handleRequestError(e, next);
    }
}