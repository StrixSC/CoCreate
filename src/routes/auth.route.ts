import { checkAuthenticated, checkNotAuthentified } from './../middlewares/auth.middleware';
import { logoutController } from './../controllers/auth.controller';
import { Request, Router, Response, NextFunction } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';
import passport from '../passport';

const router = Router();

router.post(
    '/login',
    checkNotAuthentified,
    passport.authenticate('local'),
    (req: Request, res: Response, next: NextFunction) => loginController(req, res, next)
);

router.post(
    '/register',
    checkNotAuthentified,
    async (req, res, next) => await registerController(req, res, next)
);

router.post(
    '/logout',
    checkAuthenticated,
    async (req, res, next) => await logoutController(req, res, next)
);

export default router;
