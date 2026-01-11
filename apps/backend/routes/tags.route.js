import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import { addLabel, listTags } from "../controllers/tags.controller.js";

const router = Router();

// Label routes require authentication.
router.use(authRequired);
router.get("/:type", listTags);
router.post("/:type/labels", addLabel);

export default router;
