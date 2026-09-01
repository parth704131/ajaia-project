import type { User } from "../../types/api.types";
import { apiRequest } from "./client";

export function fetchUsers() {
  return apiRequest<User[]>("/users");
}
