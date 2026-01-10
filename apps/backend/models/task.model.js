import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        status: {
            type: String,
            trim: true,
            default: "todo",
            maxlength: 40
        },
        order: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            trim: true,
            maxlength: 40
        },
        labels: [
            {
                type: String,
                trim: true,
                maxlength: 40
            }
        ],
        dueDate: {
            type: Date
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model("Task", taskSchema);
