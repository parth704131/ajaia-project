import type { User } from "../db/models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      currentUser: User;
    }
  }
}

export {};
