import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { insertCategory } from "./factories.js";

describe("GET /api/categories", () => {
  it("returns categories sorted by name, with only id and name", async () => {
    const wallets = await insertCategory("Wallets");
    const bags = await insertCategory("Bags");

    const res = await request(app).get("/api/categories").expect(200);

    expect(res.body).toEqual({
      categories: [
        { id: bags.id, name: "Bags" },
        { id: wallets.id, name: "Wallets" },
      ],
    });
  });
});
