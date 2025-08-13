import mongoose, { mongo } from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String,
            },
            default: {
                url: `https://placehold.co/200x200`,
                localPath: '',
            },
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            trim: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            default: '',
        },

        forgotPasswordToken: {
            type: String,
            default: '',
        },

        forgotPasswordExpiry: {
            type: Date,
            default: null,
        },

        emailVerificationToken: {
            type: String,
            default: '',
        },

        emailVerificationExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
