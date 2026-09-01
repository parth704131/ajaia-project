import { useEffect } from "react";
import { useUserStore } from "../state/store";

export function useInitializeUsers() {
  const status = useUserStore((state) => state.status);
  const error = useUserStore((state) => state.error);
  const initializeUsers = useUserStore((state) => state.initializeUsers);

  useEffect(() => {
    if (status === "idle") void initializeUsers();
  }, [initializeUsers, status]);

  return { status, error, retry: initializeUsers };
}
