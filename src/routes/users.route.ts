import { body, query } from 'express-validator';
import { checkIfAuthenticated, checkIfSelfRequest } from './../middlewares/auth.middleware';
import {
    getCompleteUserController,
    getPublicUserController,
    getPublicUsersController,
    getUserChannelsController,
    getUserLogsController,
    updateUserProfileController
} from './../controllers/users.controller';
import { Router } from 'express';

const router = Router();

// Get public information of all users
router.get('/profile', (req, res, next) => getPublicUsersController(req, res, next));

// [Protected] Update user profile
router.put('/profile', checkIfAuthenticated,
    body('username')
        .notEmpty()
        .isAlphanumeric()
        .withMessage('Username missing or invalid'),
    body('avatarUrl')
        .optional()
        .isString()
        .withMessage('Avatar Url missing or invalid'),
    (req, res, next) => updateUserProfileController(req, res, next));

// Get a user's public information by their username
router.get('/profile/:username', (req, res, next) => getPublicUserController(req, res, next));

router.get('/logs', checkIfAuthenticated,
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
    (req, res, next) =>
        getUserLogsController(req, res, next))

router.get('/:id', checkIfAuthenticated, checkIfSelfRequest, (req, res, next) =>
    getCompleteUserController(req, res, next)
);

// [Protected] Get user channels by id
router.get('/:id/channels', checkIfAuthenticated, (req, res, next) => {
    getUserChannelsController(req, res, next);
});

export default router;
