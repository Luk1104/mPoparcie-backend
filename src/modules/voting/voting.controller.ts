import { type Request, type Response, type NextFunction } from "express";
import { verifyVoteService } from "./voting.service.js";
import { type SemaphoreProofDTO } from "./voting.schema.js";
import { zkpTreeDumpService } from "../zkp-users/zkp-users.service.js";
import { getCommitmentsArrayService } from "./voting.service.js";

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

export const getGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId as string;
    const group = await zkpTreeDumpService(groupId);
    const commitments = await getCommitmentsArrayService(group);
    return res.status(200).json({ status: "success", data: commitments });
  } catch (error) {
    next(error);
  }
};
