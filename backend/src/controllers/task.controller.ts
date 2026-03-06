// backend/src/controllers/task.controller.ts
import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';
import { findNearbyProviders } from '../services/redis.service';
import { emitToUser } from '../services/socket.service';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, latitude, longitude, address } = req.body;
    const clientId = req.user?.userId; 

    if (!clientId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Save the task in Postgres
    const task = await prisma.task.create({
      data: {
        title, description, price, latitude, longitude, address, clientId,
      },
    });

    // 2. Search Redis for providers within a 10km radius
    const nearbyProviderIds = await findNearbyProviders(latitude, longitude, 10);
    console.log(`🚨 Found ${nearbyProviderIds.length} providers near the new task.`);

    // 3. Emit a real-time WebSocket event to those specific providers!
    nearbyProviderIds.forEach((providerId) => {
      emitToUser(providerId, 'new_task_available', {
        taskId: task.id,
        title: task.title,
        price: task.price,
        distance: "Calculating...", // You can calculate exact distance later if needed
      });
      console.log(`📡 Pinged provider: ${providerId}`);
    });

    res.status(201).json({ 
      message: 'Task created successfully', 
      task, 
      pingedProviders: nearbyProviderIds.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch all OPEN tasks. Include the client's first name so the frontend can display it.
    const tasks = await prisma.task.findMany({
      where: { status: 'OPEN' },
      include: {
        client: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};