import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', async (req, res, next) => await loginController(req, res, next));

router.post('/register', async (req, res, next) => await registerController(req, res, next));

export default router;