import { type Request, type Response, type NextFunction } from "express";
import {
  zkprequestuserHashService,
  zkpregisterService,
} from "./zkp-users.service.js";
import type { RegisterDTO } from "./zkp-users.schema.js";
import { zkpTreeDumpService } from "./zkp-users.service.js";

export const zkprequestuserHash = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // w tokenie jest userHash
    const token = await zkprequestuserHashService();
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
      .json({ status: "success", message: "Rejestracja/1 udana" });
  } catch (error) {
    next(error);
  }
};

export const zkpregister = async (
  req: Request<any, any, RegisterDTO>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userHash = (req as any).user?.userId;
    const commitment = req.body?.commitment;

    if (!userHash) {
      return res.status(400).json({ error: "Brak userHash w tokenie" });
    }

    const state = await zkpregisterService(userHash, commitment);
    return res
      .status(201)
      .json({ status: "success", message: "Rejestracja/2 udana" });
  } catch (error) {
    next(error);
  }
};

export const zkpTreeDump = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const treeData = await zkpTreeDumpService();
    return res.status(200).json({ status: "success", data: treeData });
  } catch (error) {
    next(error);
  }
};
