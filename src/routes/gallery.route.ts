import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { Router, NextFunction } from 'express';
import { getGalleryController } from '../controllers/gallery.controller';

const router = Router();

router.get('/', (req, res, next) => getGalleryController(req, res, next));

export default router;
