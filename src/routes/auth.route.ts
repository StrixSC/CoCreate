import { body } from 'express-validator';
import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { logoutController, refreshController } from './../controllers/auth.controller';
import { Request, Router, Response, NextFunction } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';

const router = Router();

router.get('/login', checkIfAuthenticated, (req: Request, res: Response, next: NextFunction) =>
    loginController(req, res, next)
);

router.post('/register', async (req, res, next) => await registerController(req, res, next));

router.get(
    '/logout',
    checkIfAuthenticated,
    async (req, res, next) => await logoutController(req, res, next)
);

router.get(
    '/refresh',
    checkIfAuthenticated,
    async (req, res, next) => await refreshController(req, res, next)
);

export default router;
