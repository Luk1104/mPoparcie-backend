import bcrypt from "bcrypt";
import { PetitionUserModel } from "./petition-users.model.js";
import type { RegisterDTO, LoginDTO } from "./petition-users.schema.js";

import { generateToken } from "../../shared/utils/jwt.util.js";

export const loginUser = async (data: LoginDTO) => {
  const { username, password } = data;

  const user = await PetitionUserModel.findOne({ username });
  if (!user) throw new Error("Nieprawidłowe dane logowania");

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw new Error("Nieprawidłowe dane logowania");

  const token = generateToken({
    userId: user._id.toString(),
    role: "petition_user",
  });

  return token;
};

export const registerUser = async (data: RegisterDTO) => {
  const { username, password, name, surname } = data;

  const existing = await PetitionUserModel.findOne({ username });
  if (existing) throw new Error("Użytkownik o takiej nazwie już istnieje");

  const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const created = await PetitionUserModel.create({
    username,
    passwordHash,
    name,
    surname,
  });

  //Tutaj jest generowane po ._id ale mozna tez po username
  const token = generateToken({
    userId: created._id.toString(),
    role: "petition_user",
  });

  return token;
};
