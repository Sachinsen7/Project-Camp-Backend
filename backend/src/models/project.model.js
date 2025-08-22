import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            tyoe: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true },
);

const ProjectModel = mongoose.model('Project', projectSchema);
export { ProjectModel };
