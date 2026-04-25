import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type TokenPayload } from '../utils/jwt.util.js';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Token is expected in the Cookie header as 'token=<value>'
  const cookieHeader = req.headers.cookie as string | undefined;
  let token: string | undefined;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) token = decodeURIComponent(tokenCookie.split('=')[1] || '');
  }

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu w ciasteczkach' });
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