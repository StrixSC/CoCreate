import { MemberType } from "@prisma/client";
import { Router, Response, Request, NextFunction } from "express";
import { validationResult, matchedData } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { GetTeamsPayload, TeamResponse } from "../models/Teams.model";
import { DEFAULT_DRAWING_OFFSET, DEFAULT_DRAWING_LIMIT } from "../utils/drawings";
import { handleRequestError } from "../utils/errors";
import { query, param } from 'express-validator';
import { getTeams } from '../services/teams.service';
import { getTeamInfoById, getTeamsController } from "../controllers/team.controller";

const router = Router();

router.get('/', checkIfAuthenticated,
    query('offset')
        .optional()
        .isNumeric()
        .withMessage('Offset must be a numeric value')
        .toInt(),
    query('limit')
        .optional()
        .isNumeric()
        .withMessage('Limit must be a numeric value')
        .toInt(),
    query('filter')
        .optional()
        .toLowerCase(),
    query('removeFull')
        .optional()
        .toBoolean(),
    query('amMember')
        .optional()
        .toBoolean(),
    query('amOwner')
        .optional()
        .toBoolean(),
    query('type')
        .optional()
        .isIn(['Public', 'Protected'])
        .withMessage('Provided type is not valid. Please ensure that the provided type is either "Public" or "Protected".'),
    (req, res, next) => getTeamsController(req, res, next));

router.get('/:id', checkIfAuthenticated,
    param('id')
        .isAscii()
        .withMessage('Provided id is not a valid team ID.'),
    (req, res, next) => getTeamInfoById(req, res, next));

export default router;
