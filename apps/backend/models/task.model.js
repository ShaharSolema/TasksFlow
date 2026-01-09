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
            enum: ["todo", "in-progress", "done"],
            default: "todo"
        },
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
