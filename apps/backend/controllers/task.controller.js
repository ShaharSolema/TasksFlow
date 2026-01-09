import { Task } from "../models/task.model.js";

const createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }
        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : undefined,
            status,
            dueDate,
            owner: req.user._id
        });
        await task.save();
        return res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const listTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json(tasks);
    } catch (error) {
        console.error("Error listing tasks:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }
        return res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        const updates = {};
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ message: "Title cannot be empty." });
            }
            updates.title = title.trim();
        }
        if (description !== undefined) {
            updates.description = description ? description.trim() : "";
        }
        if (status !== undefined) {
            updates.status = status;
        }
        if (dueDate !== undefined) {
            updates.dueDate = dueDate;
        }
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            updates,
            { new: true, runValidators: true }
        );
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }
        return res.status(200).json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }
        return res.status(200).json({ message: "Task deleted." });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { createTask, listTasks, getTaskById, updateTask, deleteTask };
