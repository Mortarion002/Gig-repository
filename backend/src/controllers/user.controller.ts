// backend/src/controllers/user.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { updateProviderLocation } from '../services/redis.service';

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user?.userId;

    if (!userId || req.user?.role !== 'PROVIDER') {
      res.status(403).json({ error: 'Only logged-in providers can update their location' });
      return;
    }

    // Ping Redis with the new coordinates
    await updateProviderLocation(userId, latitude, longitude);

    res.status(200).json({ message: 'Location updated in Redis' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};