// backend/src/routes/user.routes.ts
import { Router } from 'express';
import { updateLocation } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// PUT /api/users/location
router.put('/location', verifyToken, updateLocation);

export default router;