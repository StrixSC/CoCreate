import { body, param, query } from 'express-validator';
import { checkIfAuthenticated, checkIfSelfRequest } from './../middlewares/auth.middleware';
import {
    getCompleteUserController,
    getPublicUserController,
    getPublicUsersController,
    getUserChannelsController,
    getUserLogsController
} from './../controllers/users.controller';
import { Router } from 'express';

const router = Router();

// Get public information of all users
router.get('/profile', (req, res, next) => getPublicUsersController(req, res, next));

// Get a user's public information by their username
router.get('/profile/:username', (req, res, next) => getPublicUserController(req, res, next));

// [Protected] Get complete information of a user. Requesting user must have a req.user.user_id === the provided id
router.get('/:id', checkIfAuthenticated, checkIfSelfRequest, (req, res, next) =>
    getCompleteUserController(req, res, next)
);

// [Protected] Get user channels by id
router.get('/:id/channels', checkIfAuthenticated, (req, res, next) => {
    getUserChannelsController(req, res, next);
});

router.get('/:id/logs', checkIfAuthenticated, checkIfSelfRequest,
    param('id')
        .notEmpty()
        .trim()
        .isAlphanumeric()
        .withMessage('Missing ID as url parameter.'),
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
    (req, res, next) => getUserLogsController(req, res, next));

export default router;
