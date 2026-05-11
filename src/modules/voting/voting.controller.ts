import { type Request, type Response, type NextFunction } from "express";
import { verifyVoteService, getPathService } from "./voting.service.js";
import { type SemaphoreProofDTO } from "./voting.schema.js";

const stringifyBigInts = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

export const verifyVote = async (
  req: Request<any, any, { proof: SemaphoreProofDTO; id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { proof, id } = req.body;
    await verifyVoteService(proof, id);
    return res.status(200).json({ status: "success", message: "Głos oddany" });
  } catch (error) {
    next(error);
  }
};

export const getPath = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commitment = req.params.commitment as string;
    const path = await getPathService(commitment);

    // Transform BigInt to string because express JSON.stringify doesn't support BigInt
    const serializedPath = stringifyBigInts(path);

    return res.status(200).json({ status: "success", data: serializedPath });
  } catch (error) {
    next(error);
  }
};
