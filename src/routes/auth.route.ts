import { imageFilter } from './../middlewares/users.middleware';
import { body } from 'express-validator';
import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { logoutController, refreshController, updateUserPasswordController } from './../controllers/auth.controller';
import { Request, Router, Response, NextFunction } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';

import multer from 'multer';

const MIN_PASS_LENGTH = 8;
const MAX_PASS_LENGTH = 256;

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter: imageFilter }).any()

router.get('/login', checkIfAuthenticated, (req: Request, res: Response, next: NextFunction) =>
    loginController(req, res, next)
);

router.post('/register', upload,
    body("username")
        .notEmpty()
        .isAlphanumeric()
        .withMessage('Invalid or missing username'),
    body("email")
        .notEmpty()
        .isEmail({ allow_display_name: false, allow_utf8_local_part: true, ignore_max_length: true, allow_ip_domain: true })
        .withMessage('Invalid or missing email'),
    body("password")
        .notEmpty()
        .isAlphanumeric()
        .isLength({ min: MIN_PASS_LENGTH, max: MAX_PASS_LENGTH })
        .withMessage('Invalid or missing password. Password must be alphanumeric and between 8 to 256 characters.'),
    body("first_name")
        .notEmpty()
        .withMessage("Invalid or missing first name."),
    body("last_name")
        .notEmpty()
        .withMessage("Invalid or missing last name."),
    body("avatar_url")
        .optional()
        .isURL(),
    async (req, res, next) => await registerController(req, res, next));

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

router.put(
    '/update/password',
    checkIfAuthenticated,
    body('password')
        .notEmpty()
        .isAlphanumeric()
        .isLength({ min: MIN_PASS_LENGTH, max: MAX_PASS_LENGTH }),
    async (req, res, next) => await updateUserPasswordController(req, res, next));
export default router;
