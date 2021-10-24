import { createChannelController } from './../controllers/channels.controller';
import { checkAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';
import { body } from 'express-validator';

const router = Router();

// Get all channels
router.get('/', checkAuthenticated, (req, res, next) => {});

// Get information of a channel
router.get('/:id', checkAuthenticated, (req, res, next) => {});

// Get the list of messages of a channel
router.get('/:id/messages', checkAuthenticated, (req, res, next) => {});

router.post(
    '/create',
    checkAuthenticated,
    body('name')
        .notEmpty()
        .trim()
        .isAlphanumeric()
        .isLength({
            min: 4,
            max: 256
        })
        .withMessage('Channel name must be alphanumeric and between 4 to 256 characters.'),
    // TODO: Figure out how to handle private channel making.
    // body('isPrivate')
    //     .notEmpty()
    //     .trim()
    //     .isBoolean()
    //     .toBoolean()
    //     .withMessage('Invalid or missing isPrivate attribute field'),
    (req, res, next) => createChannelController(req, res, next)
);

// Add a message to a channel
// router.post('/:id/messages/', checkAuthenticated, body('message-data').notEmpty().trim().is,withMessage("Message content cannot be empty"), body('channel_id').notEmpty().trim().withMessage("Must be a non empty alphanumeric.") (req, res, next) => {});

// Update a channel's information
router.put('/:id', checkAuthenticated, (req, res, next) => {});

// Delete a channel by its ID
router.delete('/:id', checkAuthenticated, (req, res, next) => {});

export default router;
