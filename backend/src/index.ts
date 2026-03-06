// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes'; 
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';
import { connectRedis } from './services/redis.service';
import { createServer } from 'http';
import { initSocketServer } from './services/socket.service'
const app = express();
const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Gig Marketplace API is running!' });
});

// Initialize Socket.io with the HTTP server
initSocketServer(httpServer);

// Use httpServer.listen instead of app.listen
connectRedis().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch(console.error);