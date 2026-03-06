// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback';

// Extend the Express Request type to include our custom user payload
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Grab the token from the headers
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  // 2. The header format is "Bearer <token_string>", so we split it to get just the token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using your secret
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // 4. Attach the decoded payload to the request object
    req.user = decoded;
    
    // 5. Pass control to the next middleware or controller
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};