import {
    getCompleteUserController,
    getPublicUserController,
    getPublicUsersController,
    getUserChannelsController
} from './../controllers/users.controller';
import { checkAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

// Get public information of all users
router.get('/profile', (req, res, next) => getPublicUsersController(req, res, next));

// Get a user's public information by their username
router.get('/profile/:username', (req, res, next) => getPublicUserController(req, res, next));

// [Protected] Get complete information of a user. Requesting user must have a req.user.user_id === the provided id
router.get('/:id', checkAuthenticated, (req, res, next) =>
    getCompleteUserController(req, res, next)
);

// [Protected] Get user channels by id
router.get('/:id/channels', checkAuthenticated, (req, res, next) => {
    getUserChannelsController(req, res, next);
});

export default router;
