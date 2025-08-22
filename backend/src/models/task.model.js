import mongoose, { Schema } from 'mongoose';
import { AvailableUserRole, TaskStatus } from '../utils/constants';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: AvailableUserRole,
            default: TaskStatus.TODO,
        },
        attachments: {
            type: [
                {
                    url: String,
                    mimetype: String,
                    size: Number,
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

const taskModel = mongoose.model('Task', taskSchema);
export { taskModel };
