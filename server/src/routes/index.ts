import { Router } from 'express';
import * as HomePage from './homepage';


const router = Router();

// All API Requests listed below. Follow the example.
router.get('/', HomePage.WelcomeMessage);

export default router;
