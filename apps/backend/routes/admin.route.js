import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import adminRequired from "../middleware/admin.middleware.js";
import { getAnalytics, listUsers, updateUserRole } from "../controllers/admin.controller.js";

const router = Router();

router.get("/analytics", authRequired, adminRequired, getAnalytics);
router.get("/users", authRequired, adminRequired, listUsers);
router.patch("/users/:id/role", authRequired, adminRequired, updateUserRole);

export default router;
