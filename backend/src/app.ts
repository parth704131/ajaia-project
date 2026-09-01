import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createDocumentRouter } from "./routes/document.routes.js";
import { createImportRouter } from "./routes/import.routes.js";
import { createUserRouter } from "./routes/user.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "Ajaia Docs API",
    });
  });

  app.use("/api/users", createUserRouter());
  app.use("/api/documents", createDocumentRouter());
  app.use("/api/import", createImportRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;