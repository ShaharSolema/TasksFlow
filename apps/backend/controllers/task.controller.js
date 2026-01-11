import { Task } from "../models/task.model.js";

// Create a task for the authenticated user.
const createTask = async (req, res) => {
    try {
        const { title, description, status, labels, dueDate, order } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }
        // Link the task to the logged-in user.
        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : undefined,
            status,
            order: Number.isFinite(order) ? order : 0,
            labels,
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

// List tasks for the current user only.
const listTasks = async (req, res) => {
    try {
        // Only return tasks owned by this user.
        const tasks = await Task.find({ owner: req.user._id }).sort({ order: 1, createdAt: -1 });
        return res.status(200).json(tasks);
    } catch (error) {
        console.error("Error listing tasks:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Load a single task, scoping by owner for safety.
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

// Update fields that were sent by the client.
const updateTask = async (req, res) => {
    try {
        const { title, description, status, labels, dueDate, order } = req.body;
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
        if (order !== undefined) {
            updates.order = Number(order);
        }
        if (labels !== undefined) {
            updates.labels = labels;
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
