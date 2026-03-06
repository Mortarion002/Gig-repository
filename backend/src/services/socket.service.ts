// backend/src/services/socket.service.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback';

// This Map stores the active connections: { userId: socketId }
export const connectedUsers = new Map<string, string>();

let io: SocketIOServer;

export const initSocketServer = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // In production, restrict this to your frontend domains
      methods: ['GET', 'POST']
    }
  });

  // Middleware to authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      // Attach the decoded userId to the socket object
      (socket as any).userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    
    // Store the mapping
    connectedUsers.set(userId, socket.id);
    console.log(`🟢 User ${userId} connected with socket ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`🔴 User ${userId} disconnected`);
    });
  });
};

// Helper function to send an event to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};