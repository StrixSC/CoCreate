import {
    createChannelController,
    getAllChannelsController,
    getChannelByIdController,
    getChannelMessagesController
} from './../controllers/channels.controller';
import { checkIfAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';
import { body, param } from 'express-validator';

const router = Router();

// Get all channels
// TODO: Implement pagination
router.get('/', checkIfAuthenticated, (req, res, next) => getAllChannelsController(req, res, next));

router.get('/:id', checkIfAuthenticated, param('id').notEmpty().trim(), (req, res, next) =>
    getChannelByIdController(req, res, next)
);

// Get the list of messages of a channel
router.get('/:id/messages', checkIfAuthenticated, param('id'), (req, res, next) =>
    getChannelMessagesController(req, res, next)
);

router.post(
    '/create',
    checkIfAuthenticated,
    body('name')
        .notEmpty()
        .trim()
        .isAlphanumeric()
        .isLength({
            min: 4,
            max: 256
        })
        .withMessage('Channel name must be alphanumeric and between 4 to 256 characters.'),
    (req, res, next) => createChannelController(req, res, next)
);

// Update a channel's information
router.put('/:id', checkIfAuthenticated, (req, res, next) => { });

// Delete a channel by its ID
router.delete('/:id', checkIfAuthenticated, (req, res, next) => { });

export default router;
