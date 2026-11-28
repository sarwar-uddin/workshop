import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { insertCategory, insertProduct } from "./factories.js";

const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

describe("GET /api/products", () => {
  it("returns an empty list when there are no products", async () => {
    const res = await request(app).get("/api/products").expect(200);

    expect(res.body).toEqual({ products: [] });
  });

  it("returns products sorted by name, with their category joined in", async () => {
    const wallets = await insertCategory("Wallets");
    await insertProduct({ name: "Zip Pouch", categoryId: wallets.id });
    await insertProduct({ name: "Bifold Wallet", categoryId: wallets.id, price: "1850.50" });

    const res = await request(app).get("/api/products").expect(200);

    expect(res.body.products.map((p: { name: string }) => p.name)).toEqual(["Bifold Wallet", "Zip Pouch"]);
    expect(res.body.products[0]).toMatchObject({
      price: "1850.50", // money stays a string end to end, never a float
      stockQuantity: 0,
      status: "active",
      category: { id: wallets.id, name: "Wallets" },
    });
  });

  it("keeps products that have no category (LEFT JOIN, not INNER)", async () => {
    await insertProduct({ name: "Gift Wrapping", categoryId: null });

    const res = await request(app).get("/api/products").expect(200);

    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].category).toBeNull();
  });
});

describe("GET /api/products/:id", () => {
  it("returns the product", async () => {
    const product = await insertProduct({ sku: "WAL-BIF-01" });

    const res = await request(app).get(`/api/products/${product.id}`).expect(200);

    expect(res.body.product).toMatchObject({ id: product.id, sku: "WAL-BIF-01" });
  });

  it("returns 404 for an id that doesn't exist", async () => {
    const res = await request(app).get(`/api/products/${UNKNOWN_ID}`).expect(404);

    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("returns 404, not 500, for an id that isn't a UUID", async () => {
    const res = await request(app).get("/api/products/not-a-uuid").expect(404);

    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });
});

describe("POST /api/products", () => {
  const valid = { sku: "WAL-BIF-01", name: "Bifold Wallet", price: "1850.00" };

  it("creates a product with defaults and returns 201 with a Location header", async () => {
    const res = await request(app).post("/api/products").send(valid).expect(201);

    expect(res.body.product).toMatchObject({
      sku: "WAL-BIF-01",
      name: "Bifold Wallet",
      price: "1850.00",
      description: null,
      category: null,
      stockQuantity: 0,
      status: "active",
    });
    expect(res.headers.location).toBe(`/api/products/${res.body.product.id}`);
  });

  it("stores it, so it can be read back", async () => {
    const created = await request(app).post("/api/products").send(valid).expect(201);

    await request(app).get(created.headers.location!).expect(200);
  });

  it("trims text and stores an empty description as null", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...valid, sku: "  WAL-BIF-01 ", name: " Bifold Wallet ", description: "   " })
      .expect(201);

    expect(res.body.product).toMatchObject({ sku: "WAL-BIF-01", name: "Bifold Wallet", description: null });
  });

  it("links the product to its category", async () => {
    const belts = await insertCategory("Belts");

    const res = await request(app)
      .post("/api/products")
      .send({ ...valid, categoryId: belts.id })
      .expect(201);

    expect(res.body.product.category).toEqual({ id: belts.id, name: "Belts" });
  });

  it.each([
    ["1850", "1850.00"],
    ["1850.5", "1850.50"],
    ["0", "0.00"],
  ])("accepts price %j and stores it as %j", async (price, stored) => {
    const res = await request(app).post("/api/products").send({ ...valid, price }).expect(201);

    expect(res.body.product.price).toBe(stored);
  });

  it.each([["1e3"], ["-5"], ["12.345"], [""], [1850]])("rejects price %j", async (price) => {
    const res = await request(app).post("/api/products").send({ ...valid, price }).expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toContainEqual(expect.objectContaining({ path: "price" }));
  });

  it("reports every invalid field at once, not just the first", async () => {
    const res = await request(app).post("/api/products").send({}).expect(400);

    const paths = res.body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(["sku", "name", "price"]));
  });

  it("rejects stockQuantity: stock only changes through inventory adjustments", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...valid, stockQuantity: 50 })
      .expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(res.body.error.details)).toContain("stockQuantity");
  });

  it("returns 400 INVALID_JSON for a body that isn't valid JSON", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Content-Type", "application/json")
      .send('{"sku": "oops",')
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("returns 409 when the SKU is taken, ignoring case", async () => {
    await insertProduct({ sku: "WAL-BIF-01" });

    const res = await request(app)
      .post("/api/products")
      .send({ ...valid, sku: "wal-bif-01" })
      .expect(409);

    expect(res.body.error.code).toBe("SKU_TAKEN");
    expect(res.body.error.details).toEqual([expect.objectContaining({ path: "sku" })]);
  });

  it("returns 400 when the category doesn't exist", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...valid, categoryId: UNKNOWN_ID })
      .expect(400);

    expect(res.body.error.code).toBe("CATEGORY_NOT_FOUND");
  });
});

describe("PATCH /api/products/:id", () => {
  it("changes only the fields sent and bumps updatedAt", async () => {
    const product = await insertProduct({
      name: "Old name",
      price: "500.00",
      updatedAt: new Date("2020-01-01T00:00:00Z"),
    });

    const res = await request(app)
      .patch(`/api/products/${product.id}`)
      .send({ name: "New name" })
      .expect(200);

    expect(res.body.product).toMatchObject({ name: "New name", price: "500.00", sku: product.sku });
    expect(new Date(res.body.product.updatedAt).getTime()).toBeGreaterThan(
      new Date("2020-01-01T00:00:00Z").getTime(),
    );
  });

  it("archives and restores a product", async () => {
    const product = await insertProduct();

    await request(app).patch(`/api/products/${product.id}`).send({ status: "archived" }).expect(200);
    const res = await request(app).patch(`/api/products/${product.id}`).send({ status: "active" }).expect(200);

    expect(res.body.product.status).toBe("active");
  });

  it("removes the category when categoryId is null", async () => {
    const wallets = await insertCategory();
    const product = await insertProduct({ categoryId: wallets.id });

    const res = await request(app)
      .patch(`/api/products/${product.id}`)
      .send({ categoryId: null })
      .expect(200);

    expect(res.body.product.category).toBeNull();
  });

  it("rejects an empty body", async () => {
    const product = await insertProduct();

    const res = await request(app).patch(`/api/products/${product.id}`).send({}).expect(400);

    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects stockQuantity and leaves stock unchanged", async () => {
    const product = await insertProduct({ stockQuantity: 5 });

    await request(app).patch(`/api/products/${product.id}`).send({ stockQuantity: 999 }).expect(400);

    const res = await request(app).get(`/api/products/${product.id}`).expect(200);
    expect(res.body.product.stockQuantity).toBe(5);
  });

  it("returns 409 when changing the SKU to one another product uses", async () => {
    await insertProduct({ sku: "TAKEN-01" });
    const product = await insertProduct({ sku: "MINE-01" });

    const res = await request(app)
      .patch(`/api/products/${product.id}`)
      .send({ sku: "taken-01" })
      .expect(409);

    expect(res.body.error.code).toBe("SKU_TAKEN");
  });

  it("returns 404 for an id that doesn't exist", async () => {
    const res = await request(app).patch(`/api/products/${UNKNOWN_ID}`).send({ name: "X" }).expect(404);

    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });
});
