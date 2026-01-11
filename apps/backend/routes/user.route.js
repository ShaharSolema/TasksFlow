import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    getCurrentUser
} from "../controllers/user.controller.js";
import authRequired from "../middleware/auth.middleware.js";

const router = Router();
// Authentication routes.
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authRequired, getCurrentUser);
router.put("/update-profile", authRequired, updateUserProfile);

export default router;
