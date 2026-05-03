import { type Request, type Response, type NextFunction } from 'express';

//Muszą być 4 argumenty (err, req, res, next
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Błąd Serwera]: ${err.message}`); // Logujemy błąd w terminalu

  // Domyślny status to 500
  const statusCode = err.status || 500;
  
  const message = err.message;

    return res
        .status(statusCode)
        .json({ status: "error", message: message || "Wystąpił błąd" });
};