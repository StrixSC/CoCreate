import { imageFilter } from './../middlewares/users.middleware';
import { body, query } from 'express-validator';
import multer from 'multer';

import { checkIfAuthenticated, checkIfSelfRequest } from './../middlewares/auth.middleware';
import {
    getCompleteUserController,
    getPublicUserController,
    getPublicUsersController,
    getUserAvatarsController,
    getUserChannelsController,
    getUserLogsController,
    getUserTeamsController,
    updateUserProfileController,
    uploadAndChangeUserAvatarController
} from './../controllers/users.controller';
import { Router } from 'express';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter: imageFilter }).single('avatar');

// Get public information of all users
router.get('/profile', (req, res, next) => getPublicUsersController(req, res, next));

router.post('/upload/avatar', checkIfAuthenticated, upload,
    (req, res, next) => uploadAndChangeUserAvatarController(req, res, next));

router.get('/avatars', checkIfAuthenticated, (req, res, next) => getUserAvatarsController(req, res, next))
// [Protected] Update user profile
router.put('/profile', checkIfAuthenticated,
    body('username')
        .notEmpty()
        .isAlphanumeric()
        .withMessage('Username missing or invalid'),
    body('avatarUrl')
        .optional()
        .isString()
        .isURL()
        .withMessage('Avatar Url missing or invalid'),
    (req, res, next) => updateUserProfileController(req, res, next));

// Get a user's public information by their username
router.get('/profile/:username', (req, res, next) => getPublicUserController(req, res, next));

router.get('/teams', checkIfAuthenticated, (req, res, next) => getUserTeamsController(req, res, next));

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
