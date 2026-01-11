import { Job } from "../models/job.model.js";

const createJob = async (req, res) => {
    try {
        const {
            company,
            title,
            status,
            order,
            jobType,
            labels,
            priority,
            location,
            link,
            expectedSalary,
            salaryCurrency,
            salarySource,
            notes,
            appliedDate,
            nextInterviewDate,
            followUpDate,
            reminders
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        const job = new Job({
            company: company ? company.trim() : "",
            title: title.trim(),
            status,
            order: Number.isFinite(order) ? order : 0,
            jobType,
            labels,
            priority,
            location,
            link,
            expectedSalary,
            salaryCurrency,
            salarySource,
            notes,
            appliedDate,
            nextInterviewDate,
            followUpDate,
            reminders,
            owner: req.user._id
        });

        await job.save();
        return res.status(201).json(job);
    } catch (error) {
        console.error("Error creating job:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const listJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ owner: req.user._id }).sort({ order: 1, createdAt: -1 });
        return res.status(200).json(jobs);
    } catch (error) {
        console.error("Error listing jobs:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, owner: req.user._id });
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }
        return res.status(200).json(job);
    } catch (error) {
        console.error("Error fetching job:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const updateJob = async (req, res) => {
    try {
        const updates = req.body || {};
        if (updates.title !== undefined && !updates.title.trim()) {
            return res.status(400).json({ message: "Title cannot be empty." });
        }
        if (updates.company !== undefined) updates.company = updates.company.trim();
        if (updates.title) updates.title = updates.title.trim();
        if (updates.order !== undefined) updates.order = Number(updates.order);

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            updates,
            { new: true, runValidators: true }
        );
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }
        return res.status(200).json(job);
    } catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }
        return res.status(200).json({ message: "Job deleted." });
    } catch (error) {
        console.error("Error deleting job:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const estimateSalary = async (req, res) => {
    try {
        const { title, location, jobType } = req.query;
        const apiUrl = process.env.SALARY_API_URL;
        const apiKey = process.env.SALARY_API_KEY;
        const apiHeader = process.env.SALARY_API_HEADER || "Authorization";

        if (!apiUrl || !apiKey) {
            return res.status(503).json({ message: "Salary API not configured." });
        }
        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        const url = new URL(apiUrl);
        url.searchParams.set("title", title);
        if (location) url.searchParams.set("location", location);
        if (jobType) url.searchParams.set("jobType", jobType);

        const response = await fetch(url.toString(), {
            headers: {
                [apiHeader]: apiHeader.toLowerCase() === "authorization" ? `Bearer ${apiKey}` : apiKey
            }
        });
        if (!response.ok) {
            const text = await response.text();
            return res.status(502).json({ message: "Salary API failed.", details: text });
        }
        const payload = await response.json();

        const estimate =
            payload?.estimated_salary ||
            payload?.salary ||
            payload?.estimate ||
            payload?.data?.salary ||
            payload?.data?.estimate ||
            null;
        const currency = payload?.currency || payload?.data?.currency || "USD";

        return res.status(200).json({ estimate, currency, raw: payload });
    } catch (error) {
        console.error("Error estimating salary:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export { createJob, listJobs, getJobById, updateJob, deleteJob, estimateSalary };
