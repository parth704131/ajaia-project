import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";

export function createUserRouter() {
  const router = Router();
  router.get("/", listUsers);
  return router;
}
