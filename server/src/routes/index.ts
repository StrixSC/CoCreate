import { json } from 'body-parser';
import { Router } from 'express';
import * as HomePage from './homepage';



const router = Router();
const jsonParser = json();

// All API Requests listed below. Follow the example.
router.get('/', jsonParser, HomePage.WelcomeMessage);

export default router;
