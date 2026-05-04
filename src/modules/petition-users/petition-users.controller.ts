import { type Request, type Response, type NextFunction } from "express";
import {
  registerUser,
  loginUser,
  deleteUserService,
} from "./petition-users.service.js";
import type { RegisterDTO, LoginDTO } from "./petition-users.schema.js";

export const login = async (
  req: Request<any, any, LoginDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await loginUser(req.body);
    if (token) {
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request<any, any, RegisterDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await registerUser(req.body);
    if (token) {
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res
      .status(201)
      .json({ status: "success", message: "Rejestracja udana"});
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user.userId;
    const userRole = user.role;
    await deleteUserService(userId, userRole);
    return res
      .status(200)
      .json({ status: "success", message: "Użytkownik usunięty" });
  } catch (error) {
    next(error);
  }
};
