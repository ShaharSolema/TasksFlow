import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import { addCategory, addLabel, listTags } from "../controllers/tags.controller.js";

const router = Router();

router.use(authRequired);
router.get("/:type", listTags);
router.post("/:type/categories", addCategory);
router.post("/:type/labels", addLabel);

export default router;
