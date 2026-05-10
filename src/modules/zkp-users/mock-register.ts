import crypto from "crypto";

export const mockRegister = async () => {
  // Mock implementation for registration
  const randomBytes = crypto.randomBytes(32);
  const userHash = crypto
      .createHash("sha256")
      .update(randomBytes)
      .digest("hex");

  return userHash;
};