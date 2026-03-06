// backend/src/controllers/task.controller.ts
import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/auth.middleware";
import { findNearbyProviders } from "../services/redis.service";
import { emitToUser } from "../services/socket.service";

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, price, latitude, longitude, address } =
      req.body;
    const clientId = req.user?.userId;

    if (!clientId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 1. Save the task in Postgres
    const task = await prisma.task.create({
      data: {
        title,
        description,
        price,
        latitude,
        longitude,
        address,
        clientId,
      },
    });

    // 2. Search Redis for providers within a 10km radius
    const nearbyProviderIds = await findNearbyProviders(
      latitude,
      longitude,
      10,
    );
    console.log(
      `🚨 Found ${nearbyProviderIds.length} providers near the new task.`,
    );

    // 3. Emit a real-time WebSocket event to those specific providers!
    nearbyProviderIds.forEach((providerId) => {
      emitToUser(providerId, "new_task_available", {
        taskId: task.id,
        title: task.title,
        price: task.price,
        distance: "Calculating...", // You can calculate exact distance later if needed
      });
      console.log(`📡 Pinged provider: ${providerId}`);
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
      pingedProviders: nearbyProviderIds.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const getAllTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all OPEN tasks. Include the client's first name so the frontend can display it.
    const tasks = await prisma.task.findMany({
      where: { status: "OPEN" },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const acceptTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string }; // The task ID from the URL
    const providerId = req.user?.userId;

    if (!providerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 1. Check if the task exists and is still OPEN
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (existingTask.status !== "OPEN") {
      res
        .status(400)
        .json({ error: "Too late! This gig was already claimed." });
      return;
    }

    // 2. Assign the task to the provider and update status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "ASSIGNED",
        providerId: providerId,
      },
    });

    // 3. (Bonus) Emit an event BACK to the Client to tell them their gig was accepted!
    emitToUser(existingTask.clientId, "task_accepted", {
      taskId: updatedTask.id,
      message: "A provider has accepted your gig!",
    });

    res
      .status(200)
      .json({ message: "Gig accepted successfully!", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to accept gig" });
  }
};

export const getMyTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const providerId = req.user?.userId;

    if (!providerId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch tasks assigned to this provider that are currently IN_PROGRESS or ASSIGNED
    const tasks = await prisma.task.findMany({
      where: {
        providerId: providerId,
        status: "ASSIGNED",
      },
      // Include the client info so the provider knows who they are helping
      include: {
        client: { select: { firstName: true, phone: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch your gigs" });
  }
};

export const completeTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const providerId = req.user?.userId;

    // Ensure the provider only completes their OWN assigned tasks
    const updatedTask = await prisma.task.updateMany({
      where: {
        id: id,
        providerId: providerId,
        status: "ASSIGNED",
      },
      data: {
        status: "COMPLETED",
      },
    });

    if (updatedTask.count === 0) {
      res.status(400).json({ error: "Task not found or not assigned to you." });
      return;
    }

    res.status(200).json({ message: "Task marked as completed! Great job." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to complete task" });
  }
};
