import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Files must be 1 MB or smaller"
            : error.message,
      },
    });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Request validation failed",
        details: error.flatten(),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  console.error("Unhandled request error", error);
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
    },
  });
};
