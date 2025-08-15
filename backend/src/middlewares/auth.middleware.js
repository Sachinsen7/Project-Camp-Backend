// it can get the access token via the cookies or via the Bearer token

import UserModel from '../models/user.models.js';
import ApiError from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.headers('Authorization')?.replace('Bearer ', '');

    if (!token) {
        throw new ApiError(401, 'Unothorized request');
    }

    try {
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserModel.findById(decodeToken?._id).select(
            '-password -refreshToken -emailVerificationToken -emailVerificationExpiry',
        );
        if (!user) {
            throw new ApiError(401, 'Inavild access token');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, 'Inavlid access token');
    }
});

export default verifyJWT;
