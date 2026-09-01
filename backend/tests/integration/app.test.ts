import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("health endpoint", () => {
  it("reports that the API is ready", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "Ajaia Docs API" });
  });
});
