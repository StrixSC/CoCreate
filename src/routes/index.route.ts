import { checkAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/', checkAuthenticated, (req, res) => {
    res.status(200).json({ message: 'OK!' });
});

export default router;
