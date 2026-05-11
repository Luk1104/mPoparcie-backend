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
    username: user.username,
    userId: user._id.toString(),
    role: user.role,
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
    role: "petition_user" //nie musi tego byc bo w modelu jest default ale dodaje tutaj
  });

  //Tutaj jest generowane po ._id ale mozna tez po username
  const token = generateToken({
    username: created.username,
    userId: created._id.toString(),
    role: "petition_user",
  });

  return token;
};

export const deleteUserService = async (userId: string, userRole: string) => {
  if (userRole !== "petition_user") {
    throw new Error("Brak uprawnień: tylko zwykli użytkownicy mogą usunąć swoje konto");
  }
  const deleted = await PetitionUserModel.findByIdAndDelete(userId);
  if (!deleted) throw new Error("Użytkownik nie istnieje");

  return true;
};
