import type { RequestHandler } from "express";
import { z } from "zod";
import { unauthorized } from "../errors/app-error.js";
import { findUser } from "../services/user.service.js";

const userIdSchema = z.uuid();

export function requireCurrentUser(): RequestHandler {
  return async (request, _response, next) => {
    const rawUserId = request.header("x-user-id");
    if (!rawUserId) throw unauthorized();

    const parsed = userIdSchema.safeParse(rawUserId);
    if (!parsed.success) throw unauthorized("The selected user is invalid");

    const user = await findUser(parsed.data);
    if (!user) throw unauthorized("The selected user no longer exists");

    request.currentUser = user;
    next();
  };
}
