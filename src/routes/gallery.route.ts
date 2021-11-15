import { Router, Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
import { getGalleryController } from '../controllers/gallery.controller';

const router = Router();

router.get('/',
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
    query('filter')
        .optional()
        .isAlphanumeric('fr-FR')
        .withMessage('Filter must be an alphanumeric value'),
    (req: Request, res: Response, next: NextFunction) => getGalleryController(req, res, next));

export default router;
