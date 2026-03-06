// backend/src/routes/task.routes.ts
import { Router } from "express";
import {
  createTask,
  getAllTasks,
  acceptTask,
} from "../controllers/task.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Apply the verifyToken middleware to protect these routes
router.post("/", verifyToken, createTask);
router.get("/", verifyToken, getAllTasks);
router.put("/:id/accept", verifyToken, acceptTask);

export default router;
