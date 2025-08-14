import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    userRegisterValidator,
    userLoginValidator,
} from '../validators/index.js';

const router = Router();

router.post('/register', userRegisterValidator(), validate, registerUser);
router.post('/login', userLoginValidator(), validate, loginUser);

export default router;
