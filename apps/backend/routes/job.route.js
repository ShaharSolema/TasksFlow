import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import {
    createJob,
    listJobs,
    getJobById,
    updateJob,
    deleteJob,
    estimateSalary
} from "../controllers/job.controller.js";

const router = Router();

// Job routes require authentication.
router.use(authRequired);
router.get("/", listJobs);
router.post("/", createJob);
router.get("/estimate-salary", estimateSalary);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
