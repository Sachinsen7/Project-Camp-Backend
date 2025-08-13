import { body } from 'express-validator';

const userRegisterValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is invalid'),
        body('username')
            .trim()
            .notEmpty()
            .withMessage('username is required')
            .toLowerCase()
            .withMessage('username must be in lowercase')
            .isLength({ min: 3 })
            .withMessage('username is must be at least 3 characters long'),
        body('password').trim().notEmpty().withMessage('password is required'),
        body('fullName').optional().trim(),
    ];
};

export { userRegisterValidator };
