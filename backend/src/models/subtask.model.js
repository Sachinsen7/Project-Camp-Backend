import mongoose, { Schema } from 'mongoose';
import { Schema, trim } from 'zod';

const subTaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const SubTaskModel = mongoose.model('SubTask', subTaskSchema);

export { SubTaskModel };
