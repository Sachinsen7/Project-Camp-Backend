import mongoose, { mongo } from 'mongoose';
import { ProjectMemberModel } from '../models/project-member-model';
import UserModel from '../models/user.models';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { ProjectModel } from '../models/project.model';
import { UserRolesEnum } from '../utils/constants';
import ApiError from '../utils/apiError';

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

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await ProjectModel.findById(projectId);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Project fetched successfully'));
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const project = await ProjectModel.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    await ProjectMemberModel.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, 'Project created Successfully'));
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await ProjectModel.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, 'Project updated successfully'));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await ProjectModel.findOneAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, 'Project deleted successfully'));
});

// member functions

const addMembersToProject = asyncHandler(async (req, res) => {
    const { email, role } = req.body;

    const { projectId } = req.params;
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'User does not exists');
    }
    await ProjectMemberModel.findByIdAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role,
        },
        {
            new: true,
            upsert: true,
        },
    );

    return res
        .status(201)
        .json(new ApiResponse(201, {}, 'Project member added successfully'));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await ProjectModel.findById(req.params);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    const projectMembers = await ProjectMemberModel.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                user: {
                    $arraElemAt: ['$user', 0],
                },
            },
        },
        {
            $project: {
                project: 1,
            },
        },
    ]);
});

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    addMembersToProject,
    getProjectMembers,
};
