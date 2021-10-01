import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  return res.json({
    message: 'Auth Route!',
  });
});

router.post('/login', (req, res) => {
	
});
export default router;
