import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    getCurrentUser,
    changeCurrentPassword,
    resendEmailVerification,
} from '../controllers/auth.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    userChangeCurrentPasswordValidator,
} from '../validators/index.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = Router();

// unsecured routes
router.post('/register', userRegisterValidator(), validate, registerUser);
router.post('/login', userLoginValidator(), validate, loginUser);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/refresh-token', refreshAccessToken);
router.post(
    '/forgot-password',
    userForgotPasswordValidator(),
    validate,
    forgotPasswordRequest,
);
router.post(
    '/reset-password/:resetToken',
    userResetForgotPasswordValidator(),
    validate,
    resetForgotPassword,
);

//secure
router.post('/logout', verifyJWT, logoutUser);
router.post('/current-user', verifyJWT, getCurrentUser);
router.post(
    '/change-password',
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword,
);
router.post('/resend-email-verification', verifyJWT, resendEmailVerification);

export default router;
