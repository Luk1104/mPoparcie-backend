import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

export function validateData(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages =
        result.error.issues[0]?.message || "Validation error";

      return res
        .status(400)
        .json({ error: "Invalid data", message: errorMessages });
    }

    req.body = result.data;
    return next();
  };
}
