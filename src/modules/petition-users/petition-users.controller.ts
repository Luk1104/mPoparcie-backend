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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Login successful" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error in login controller:", message);
    return res
      .status(500)
      .json({ status: "error", message: message || "Wystąpił błąd podczas logowania" });
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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res
      .status(201)
      .json({ status: "success", message: "Rejestracja udana"});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error in register controller:", message);
    return res
      .status(500)
      .json({ status: "error", message: message || "Wystąpił błąd podczas rejestracji" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user ?? {};
    const userId = String(user.userId ?? "");
    const userRole = String(user.role ?? "petition_user");
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Brak tokenu lub niezalogowany użytkownik" });
    }
    await deleteUserService(userId, userRole);
    return res
      .status(200)
      .json({ status: "success", message: "Użytkownik usunięty" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error in delete user controller:", message);
    return res
      .status(500)
      .json({
        status: "error",
        message: message || "Wystąpił błąd podczas usuwania użytkownika",
      });
  }
};
