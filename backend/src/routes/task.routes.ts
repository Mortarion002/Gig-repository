// backend/src/routes/task.routes.ts
import { Router } from 'express';
import { createTask, getAllTasks } from '../controllers/task.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Apply the verifyToken middleware to protect these routes
router.post('/', verifyToken, createTask);
router.get('/', verifyToken, getAllTasks);

export default router;