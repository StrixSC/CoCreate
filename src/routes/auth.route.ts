import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res) => login(req, res));

router.post('/register', async (req, res) => register(req, res));

export default router;
