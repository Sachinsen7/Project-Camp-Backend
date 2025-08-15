import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    userRegisterValidator,
    userLoginValidator,
} from '../validators/index.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', userRegisterValidator(), validate, registerUser);
router.post('/login', userLoginValidator(), validate, loginUser);
//secure
router.post('/logout', verifyJWT, logoutUser);

export default router;
