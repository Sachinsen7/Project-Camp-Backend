import mongoose, { Schema } from 'mongoose';

import { AvailableUserRole, UserRolesEnum } from '../utils/constants.js';

const projectMemberModel = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        role: {
            type: String,
            enum: AvailableUserRole,
            default: UserRolesEnum.MEMBER,
        },
    },
    { timestamps: true },
);

const ProjectMemberModel = mongoose.model('ProjectMemeber', projectMemberModel);

export { ProjectMemberModel };
