import { User } from "../models/user.model.js";

const pickCollections = (type) => (type === "task" ? "taskLabels" : "jobLabels");

const listTags = async (req, res) => {
    try {
        const { type } = req.params;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        const labelsKey = pickCollections(type);
        const user = await User.findById(req.user._id).select(labelsKey);
        return res.status(200).json({
            labels: user?.[labelsKey] || []
        });
    } catch (error) {
        console.error("Error loading tags:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const addLabel = async (req, res) => {
    try {
        const { type } = req.params;
        const { name, color } = req.body;
        if (!["task", "job"].includes(type)) {
            return res.status(400).json({ message: "Invalid type." });
        }
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required." });
        }
        const labelsKey = pickCollections(type);
        const user = await User.findById(req.user._id);
        const normalized = name.trim();
        const exists = (user[labelsKey] || []).some(
            (item) => item.name.toLowerCase() === normalized.toLowerCase()
        );
        if (exists) {
            return res.status(409).json({ message: "Label already exists." });
        }
        user[labelsKey] = [
            ...(user[labelsKey] || []),
            { name: normalized, color: color || "#6a8c7d" }
        ];
        await user.save();
        return res.status(201).json({ labels: user[labelsKey] });
    } catch (error) {
        console.error("Error adding label:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { listTags, addLabel };
