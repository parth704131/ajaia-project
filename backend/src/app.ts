import cors from "cors";
import express from "express";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "Ajaia Docs API" });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
  });

  return app;
}
