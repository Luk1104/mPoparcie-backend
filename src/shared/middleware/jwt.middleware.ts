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

  console.log('verifyToken: cookieHeader=', cookieHeader);

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu w ciasteczkach' });
  }

  try {
    const secret = (process.env.JWT_SECRET as string) || 'secretkey';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET is not set — using default secretkey (not secure for production)');
    }

    // Debug: decode token without verification to inspect exp/iat (dev-only)
    try {
      const decodedUnsafe = jwt.decode(token) as any;
      console.log('verifyToken: decoded (unsafe)=', {
        exp: decodedUnsafe?.exp ? new Date(decodedUnsafe.exp * 1000).toISOString() : null,
        iat: decodedUnsafe?.iat ? new Date(decodedUnsafe.iat * 1000).toISOString() : null,
        userId: decodedUnsafe?.userId,
        username: decodedUnsafe?.username,
        role: decodedUnsafe?.role,
      });
    } catch (e) {
      console.log('verifyToken: jwt.decode failed', e);
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    (req as any).user = decoded;

    next(); //tutaj przechodzimy do kolejnego middleware lub endpointu
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(403).json({ error: 'Nieważny lub wygasły token' });
  }
};