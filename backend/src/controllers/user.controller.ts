import type { RequestHandler } from "express";
import * as userService from "../services/user.service.js";

export const listUsers: RequestHandler = async (_request, response) => {
  const users = await userService.listUsers();
  response.json({ data: users });
};
