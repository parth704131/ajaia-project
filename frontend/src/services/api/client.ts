type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown };
};

const configuredApiHost = import.meta.env.VITE_API_URL?.trim().replace(
  /\/+$/,
  "",
);
const apiBaseUrl = configuredApiHost ? `${configuredApiHost}/api` : "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "UNKNOWN_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { userId?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.userId) headers.set("x-user-id", options.userId);
  if (options.body && !(options.body instanceof FormData))
    headers.set("content-type", "application/json");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & {
    data?: T;
  };
  if (!response.ok)
    throw new ApiError(
      body.error?.message ?? "The request could not be completed",
      response.status,
      body.error?.code,
      body.error?.details,
    );
  return body.data as T;
}
