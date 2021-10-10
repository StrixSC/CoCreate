import { Router } from 'express';
import passport from '../passport';

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({
    message: 'OK!',
  });
});

export default router;
