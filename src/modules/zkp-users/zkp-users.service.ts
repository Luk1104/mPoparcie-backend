import bcrypt from "bcrypt";
import crypto from "crypto";
import { ZkpUserModel } from "./zkp-users.model.js";
import type { RegisterDTO } from "./zkp-users.schema.js";

// Helper function to encrypt text using AES-256-GCM
const encryptWithAES256 = (textToEncrypt: string, password: string) => {
  // 1. Generate a random salt for key derivation
  const salt = crypto.randomBytes(16);

  // 2. Derive a 32-byte key from the password using scrypt
  const key = crypto.scryptSync(password, salt, 32);

  // 3. Generate a random Initialization Vector (IV) - 12 bytes is standard for GCM
  const iv = crypto.randomBytes(12);

  // 4. Create the Cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // 5. Encrypt the text
  let encryptedText = cipher.update(textToEncrypt, "utf8", "hex");
  encryptedText += cipher.final("hex");

  // 6. Get the authentication tag (verifies data wasn't tampered with)
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encryptedText,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

export const registerUser = async (data: RegisterDTO) => {
  // zamokowana i niekompletna funkcja - czekamy na identta
  const { username, password } = data;

  const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const usernameHash = await bcrypt.hash(username, SALT_ROUNDS);

  const existing = await ZkpUserModel.findOne({ usernameHash });
  if (existing) throw new Error("Użytkownik o takiej nazwie już istnieje");

  // 1. Generate a random string and hash it with SHA-256
  const randomBytes = crypto.randomBytes(32);
  const randomSha256Hash = crypto
    .createHash("sha256")
    .update(randomBytes)
    .digest("hex");

  // 2. Encrypt the SHA-256 hash using the user's password
  const encryptedPayload = encryptWithAES256(randomSha256Hash, password);

  const created = await ZkpUserModel.create({
    username: usernameHash,
    userHash: encryptedPayload.encryptedData,
    salt: encryptedPayload.salt,
    iv: encryptedPayload.iv,
    authTag: encryptedPayload.authTag,
  });

  return { success: true, message: "Rejestracja udana"};
};
