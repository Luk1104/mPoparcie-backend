import { type Request, type Response } from "express";
import {
  registerUser,
  loginUser,
  deleteUserService,
} from "./petition-users.service.js";
import type { RegisterDTO, LoginDTO } from "./petition-users.schema.js";

export const login = async (
  req: Request<any, any, LoginDTO>,
  res: Response,
) => {
  try {
    const token = await loginUser(req.body);
    if (token) {
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Login successful" });
  } catch (error) {
    console.log("Error in login controller:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Wystąpił błąd podczas logowania" });
  }
};

export const register = async (
  req: Request<any, any, RegisterDTO>,
  res: Response,
) => {
  try {
    const token = await registerUser(req.body);
    if (token) {
      res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    return res
      .status(201)
      .json({ status: "success", message: "Rejestracja udana"});
  } catch (error) {
    console.log("Error in register controller:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Wystąpił błąd podczas rejestracji" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user.userId;
    await deleteUserService(userId);
    return res
      .status(200)
      .json({ status: "success", message: "Użytkownik usunięty" });
  } catch (error) {
    console.log("Error in delete user controller:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Wystąpił błąd podczas usuwania użytkownika",
      });
  }
};
