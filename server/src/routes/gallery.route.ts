import { getMyGalleryController } from './../controllers/gallery.controller';
import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { Router, Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
import { getGalleryController } from '../controllers/gallery.controller';

const router = Router();

router.get('/', checkIfAuthenticated,
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
        .toLowerCase(),
    query('type')
        .optional()
        .isIn(['Public', 'Protected'])
        .withMessage('Provided type is not valid. Please ensure that the provided type is either "Public" or "Protected".'),
    (req: Request, res: Response, next: NextFunction) => getGalleryController(req, res, next));

router.get('/mine', checkIfAuthenticated,
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
        .toLowerCase(),
    query('type')
        .optional()
        .isIn(['Private', 'Public', 'Protected'])
        .withMessage('Provided type is not valid. Please ensure that the provided type is either "Public", "Private" or "Protected".'),
    (req: Request, res: Response, next: NextFunction) => getMyGalleryController(req, res, next));

export default router;
