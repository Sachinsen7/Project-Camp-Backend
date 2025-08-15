import UserModel from '../models/user.models.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    sendEmail,
    emailVefification,
    forgotPasswordMailgen,
} from '../utils/mail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            'Something went wrong while generating access and refresh token',
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        throw new ApiError(400, 'All required fields must be provided');
    }

    const existedUser = await UserModel.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists');
    }

    const user = await UserModel.create({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        await user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: 'Please verify your email',
        mailgenContent: emailVefification(
            user.username,
            `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await UserModel.findById(user._id).select(
        '-password -refreshToken -emailVerificationToken -emailVerificationExpiry',
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            'Something went wrong while registering a user',
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                'User registered successfully. Verification email has been sent to your email.',
            ),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!username || !email) {
        throw new ApiError(400, 'Username or email is required');
    }

    const user = await UserModel.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(400, 'user does not exist');
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Inavlid Credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );

    const logInUser = await UserModel.findById(user._id).select(
        '-password -refreshToken -emailVerificationToken -emailVerificationExpiry',
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: logInUser,
                    accessToken,
                    refreshToken,
                },
                'User logged in successfully',
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: '',
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User Logged out'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, 'Current User fetched successfully'),
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, 'Email verification toke is missing');
    }

    let hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    await UserModel.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, 'Token is Invalid or Expired');
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await UserModel.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isEmailVerified: true,
            },
            'Email is Verified',
        ),
    );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User does not exist');
    }

    if (!user.isEmailVerified) {
        throw new ApiError(409, 'Email is already verified');
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        await user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: 'Please verify your email',
        mailgenContent: emailVefification(
            user.username,
            `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unHashedToken}`,
        ),
    });

    return res.status(200).json(200, {}, 'Mail has been sent to your email ID');
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unothorized access');
    }

    try {
        const decodeRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = UserModel.findById(decodeRefreshToken?._id);

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh Token is expired');
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        user.refreshToken = newRefreshToken;

        await user.save();

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    'Access token refreshed',
                ),
            );
    } catch (error) {
        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }
    }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = UserModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'User does not exists');
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: 'Password reset request',
        mailgenContent: forgotPasswordMailgen(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                'Passwords reset request sent to your email ID',
            ),
        );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const user = await UserModel.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(489, 'Token is invalid or expired');
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password resest Successfully'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = UserModel.findById(req.user?.id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(400, 'Invalid Old Password');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changes successfully'));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword,
};
