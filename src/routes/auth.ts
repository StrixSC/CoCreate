import { Router } from 'express';
import { db } from '../db'
import { validateEmail, validatePassword } from '../utils/auth'
import errors from '../utils/errors';
import messages from '../utils/messages';
import { genSalt, hash }from "bcryptjs";

const router = Router();

router.get('/login', (req, res) => {
  return res.json({
  message: 'Auth Route!',
  });
});

router.post('/register', async (req, res) => {
	const { email, password } = req.body;

  if(!validateEmail(email) || !validatePassword(password)) {
    return res.status(errors.INVALID_AUTH_INFO.status).json({
      ...errors.INVALID_AUTH_INFO
    })
  }

  const lowercaseEmail = (email as string).toLowerCase();
  let hashedPassword = "";


  try {
    const salt = await genSalt(10);
    hashedPassword = await hash(password, salt);

    await db.user.create({data: {
      email: lowercaseEmail,
      password: hashedPassword
    }});
  } catch(e: any) {
    console.error(e);
    return res.status(errors.SERVER_ERROR.status).json({...errors.SERVER_ERROR});
  }
  
  return res.status(messages.REGISTER_SUCCESS.status).json({...messages.REGISTER_SUCCESS});
});

export default router;
