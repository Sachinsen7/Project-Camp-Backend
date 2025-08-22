import mongoose from 'mongoose';
import { ProjectMemberModel } from '../models/project-member-model';
import UserModel from '../models/user.models';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMemberModel.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: 'projects',
                localField: 'projects',
                foreignField: '_id',
                as: 'projects',
                pipeline: [
                    {
                        $lookup: {
                            from: 'projectmembers',
                            localField: _id,
                            foreignField: 'projects',
                            as: 'projectmembers',
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: '$projectmemebers',
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: '$project',
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, projects, 'Projects fetched successfully'));
});

export { getProjects };
