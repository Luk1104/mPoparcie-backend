import jwt from "jsonwebtoken";

export interface TokenPayload {
  username: string;
  userId: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error("Brak JWT_SECRET w zmiennych środowiskowych!");
  }

  //generowanie tokenu
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};
