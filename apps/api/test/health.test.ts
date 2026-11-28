import request from "supertest";
import { expect, it } from "vitest";
import { app } from "../src/app.js";

it("GET /health reports the API is up", async () => {
  const res = await request(app).get("/health").expect(200);

  expect(res.body).toEqual({ status: "ok" });
});
