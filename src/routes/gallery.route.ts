import { Router } from 'express';
import { getGalleryController } from '../controllers/gallery.controller';

const router = Router();

router.get('/', (req, res, next) => getGalleryController(req, res, next));

export default router;
