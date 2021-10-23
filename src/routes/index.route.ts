import { checkAuthenticated } from './../middlewares/auth.middleware';
import { Router } from 'express';
import passport from '../passport';
// import { handleInvalidJWT } from '../utils/auth';
// import { authenticate /} from "../middlewares/auth.middleware";

const router = Router();

router.get('/', checkAuthenticated, (req, res) => {
  res.status(200).json({ 'message': 'OK!' });
});

export default router;
