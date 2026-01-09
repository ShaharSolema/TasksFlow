import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";

const getAnalytics = async (req, res) => {
    try {
        // Tasks created per day.
        const tasksPerDay = await Task.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Task status distribution.
        const statusDistribution = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Top users by number of tasks.
        const topUsers = await Task.aggregate([
            { $group: { _id: "$owner", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    username: "$user.username",
                    count: 1
                }
            }
        ]);

        const totalUsers = await User.countDocuments();
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: "done" });
        const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return res.status(200).json({
            kpis: { totalUsers, totalTasks, completionRate },
            tasksPerDay,
            statusDistribution,
            topUsers
        });
    } catch (error) {
        console.error("Error loading analytics:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { getAnalytics };
