import { Router } from 'express';
import { registerUser } from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import { userRegisterValidator } from '../validators/index.js';

const router = Router();

router.post('/register', userRegisterValidator(), validate, registerUser);
router.post('/login', registerUser);

export default router;
