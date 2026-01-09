import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import {
    createTask,
    listTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

const router = Router();

router.use(authRequired);
router.get("/", listTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
