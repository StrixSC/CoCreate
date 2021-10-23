import {
    getPublicUserController,
    getPublicUsersController
} from './../controllers/users.controller';
import { checkAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

// Get public information of all users
router.get('/profile', (req, res, next) => getPublicUsersController(req, res, next));

// Get a user's public information by their username
router.get('/profile/:username', (req, res, next) => getPublicUserController(req, res, next));

// [Protected] Get complete information of a user. Requesting user must have a req.user.user_id === the provided id
router.get('/:id', checkAuthenticated, (req, res, next) => {});

export default router;
