import { Router } from "express";
import { loginUser,
    registerUser,
    logoutUser,
    updateUserProfile } from "../controllers/user.controller.js";
import authRequired from "../middleware/auth.middleware.js";

const router = Router();
// Define authentication routes 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update-profile", authRequired, updateUserProfile);


export default router;
