import UserModel from '../models/user.models.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail, emailVefification } from '../utils/mail.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

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
    const { email, username, password, role } = req.body;

    const existiedUser = await UserModel.findOne({
        $or: [{ username }, { email }],
    });

    if (existiedUser) {
        throw new ApiError(409, 'User with email or username already exists');
    }

    const user = await UserModel.create({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
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
                'user registered successfully Verification email has been sent to your email',
            ),
        );
});

export { registerUser };
