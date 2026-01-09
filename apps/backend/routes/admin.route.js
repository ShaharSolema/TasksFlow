import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import adminRequired from "../middleware/admin.middleware.js";
import { getAnalytics } from "../controllers/admin.controller.js";

const router = Router();

router.get("/analytics", authRequired, adminRequired, getAnalytics);

export default router;
