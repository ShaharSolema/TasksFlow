import { User } from "../models/user.model.js";

// Default columns used when a user has none.
const defaults = {
    task: [
        { key: "todo", name: "todo", color: "#e9dfcf" },
        { key: "in-progress", name: "in progress", color: "#f2e2c2" },
        { key: "done", name: "done", color: "#dcecdf" }
    ],
    job: [
        { key: "saved", name: "saved", color: "#e9dfcf" },
        { key: "applied", name: "applied", color: "#d6e4f0" },
        { key: "interview", name: "interview", color: "#f2e2c2" },
        { key: "offer", name: "offer", color: "#dcecdf" },
        { key: "rejected", name: "rejected", color: "#f4d3d0" }
    ]
};

// Map request type to the user field.
const pickKey = (type) => (type === "task" ? "taskColumns" : "jobColumns");

const normalizeKey = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

// Return columns for the current user.
const listColumns = async (req, res) => {
    try {
        const { type } = req.params;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        const key = pickKey(type);
        const user = await User.findById(req.user._id).select(key);
        if (!user[key] || user[key].length === 0) {
            user[key] = defaults[type];
            await user.save();
        }
        return res.status(200).json({ columns: user[key] });
    } catch (error) {
        console.error("Error loading columns:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Add a new column for the current user.
const addColumn = async (req, res) => {
    try {
        const { type } = req.params;
        const { name, color } = req.body;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required." });
        }
        const keyName = normalizeKey(name);
        if (!keyName) {
            return res.status(400).json({ message: "Invalid name." });
        }
        const key = pickKey(type);
        const user = await User.findById(req.user._id);
        const exists = (user[key] || []).some((col) => col.key === keyName);
        if (exists) {
            return res.status(409).json({ message: "Column already exists." });
        }
        user[key] = [
            ...(user[key] || []),
            { key: keyName, name: name.trim(), color: color || "#e9dfcf" }
        ];
        await user.save();
        return res.status(201).json({ columns: user[key] });
    } catch (error) {
        console.error("Error adding column:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Update a column name or color.
const updateColumn = async (req, res) => {
    try {
        const { type, key: columnKey } = req.params;
        const { name, color } = req.body;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        const key = pickKey(type);
        const user = await User.findById(req.user._id);
        const target = (user[key] || []).find((col) => col.key === columnKey);
        if (!target) {
            return res.status(404).json({ message: "Column not found." });
        }
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: "Name cannot be empty." });
            }
            target.name = name.trim();
        }
        if (color !== undefined) {
            target.color = color;
        }
        await user.save();
        return res.status(200).json({ columns: user[key] });
    } catch (error) {
        console.error("Error updating column:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Delete a column by key.
const deleteColumn = async (req, res) => {
    try {
        const { type, key: columnKey } = req.params;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        const key = pickKey(type);
        const user = await User.findById(req.user._id);
        const nextColumns = (user[key] || []).filter((col) => col.key !== columnKey);
        if (nextColumns.length === (user[key] || []).length) {
            return res.status(404).json({ message: "Column not found." });
        }
        user[key] = nextColumns;
        await user.save();
        return res.status(200).json({ columns: user[key] });
    } catch (error) {
        console.error("Error deleting column:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Reorder columns by the provided key list.
const reorderColumns = async (req, res) => {
    try {
        const { type } = req.params;
        const { order } = req.body;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({ message: "Order array is required." });
        }
        const key = pickKey(type);
        const user = await User.findById(req.user._id);
        const current = user[key] || [];
        const map = new Map(current.map((col) => [col.key, col]));
        if (order.length !== current.length) {
            return res.status(400).json({ message: "Order length mismatch." });
        }
        const nextColumns = [];
        for (const columnKey of order) {
            const column = map.get(columnKey);
            if (!column) {
                return res.status(400).json({ message: "Invalid column order." });
            }
            nextColumns.push(column);
        }
        user[key] = nextColumns;
        await user.save();
        return res.status(200).json({ columns: user[key] });
    } catch (error) {
        console.error("Error reordering columns:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { listColumns, addColumn, updateColumn, deleteColumn, reorderColumns };
