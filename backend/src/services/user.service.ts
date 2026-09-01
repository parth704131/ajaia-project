import { notFound } from "../errors/app-error.js";
import * as userRepository from "../repositories/user.repository.js";

export function listUsers() {
  return userRepository.findAllUsers();
}

export function findUser(id: string) {
  return userRepository.findUserById(id);
}

export async function requireUser(id: string) {
  const user = await userRepository.findUserById(id);
  if (!user) throw notFound("Selected user no longer exists");
  return user;
}
