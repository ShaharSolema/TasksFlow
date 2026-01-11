import { Router } from "express";
import authRequired from "../middleware/auth.middleware.js";
import { addColumn, listColumns, updateColumn, deleteColumn, reorderColumns } from "../controllers/columns.controller.js";

const router = Router();

router.use(authRequired);
router.get("/:type", listColumns);
router.post("/:type", addColumn);
router.patch("/:type", reorderColumns);
router.patch("/:type/:key", updateColumn);
router.delete("/:type/:key", deleteColumn);

export default router;
