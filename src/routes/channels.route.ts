import { checkAuthenticated, checkNotAuthentified } from './../middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

// Get all channels
router.get('/channels', checkAuthenticated, (req, res, next) => {});

// Get information of a channel
router.get('/channels/:id', checkAuthenticated, (req, res, next) => {});

// Get the list of messages of a channel
router.get('/channels/:id/messages', checkAuthenticated, (req, res, next) => {});

// Create a new channel
router.post('/channels/create', checkAuthenticated, (req, res, next) => {});

// Add a message to a channel
router.post('/channels/:id/messages/', checkAuthenticated, (req, res, next) => {});

// Update a channel's information
router.put('/channels/:id', checkAuthenticated, (req, res, next) => {});

// Delete a channel by its ID
router.delete('/channels/:id', checkAuthenticated, (req, res, next) => {});

export default router;
