import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type TokenPayload } from '../utils/jwt.util.js';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Token jest wysyłany w nagłówku jako "Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu w nagłówku' });
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    (req as any).user = decoded; 
    
    next(); //tutaj przechodzimy do kolejnego middleware lub endpointu
  } catch (error) {
    res.status(403).json({ error: 'Nieważny lub wygasły token' });
  }
};