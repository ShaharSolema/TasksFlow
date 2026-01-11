import mongoose, { Schema } from "mongoose";

const reminderSchema = new Schema(
    {
        date: { type: Date, required: true },
        note: { type: String, trim: true, maxlength: 200 },
        done: { type: Boolean, default: false }
    },
    { _id: false }
);

const jobSchema = new Schema(
    {
        company: {
            type: String,
            trim: true,
            maxlength: 120
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        status: {
            type: String,
            trim: true,
            default: "saved",
            maxlength: 40
        },
        order: {
            type: Number,
            default: 0
        },
        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship", "freelance"],
            default: "full-time"
        },
        labels: [
            {
                type: String,
                trim: true,
                maxlength: 40
            }
        ],
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        location: {
            type: String,
            trim: true,
            maxlength: 120
        },
        link: {
            type: String,
            trim: true,
            maxlength: 400
        },
        expectedSalary: {
            type: Number
        },
        salaryCurrency: {
            type: String,
            default: "USD",
            maxlength: 10
        },
        salarySource: {
            type: String,
            trim: true,
            maxlength: 120
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        appliedDate: {
            type: Date
        },
        nextInterviewDate: {
            type: Date
        },
        followUpDate: {
            type: Date
        },
        reminders: [reminderSchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
