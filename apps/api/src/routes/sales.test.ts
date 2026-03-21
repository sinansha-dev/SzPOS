import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { salesRouter } from "./sales.js";
import { products, sales } from "../services/store.js";

const baselineProducts = products.map((product) => ({ ...product }));

function resetStore() {
  products.splice(0, products.length, ...baselineProducts.map((product) => ({ ...product })));
  for (const key of Object.keys(sales)) {
    delete sales[key];
  }
}

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use("/api/sales", salesRouter);

  const server = await new Promise<import("node:http").Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to bind test server");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test("rejects oversell when same product appears multiple times", async () => {
  resetStore();

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "sale_duplicate_oversell",
        items: [
          { id: "p_001", qty: 8 },
          { id: "p_001", qty: 8 }
        ]
      })
    });

    assert.equal(response.status, 409);
    const payload = await response.json() as { error: string; details?: string[] };
    assert.equal(payload.error, "Insufficient stock");
    assert.ok(payload.details?.some((detail) => detail.includes("has only 12 in stock")));
  });
});

test("decrements stock for successful sale and stores normalized items", async () => {
  resetStore();

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "sale_ok",
        items: [
          { id: "p_002", qty: 2 },
          { id: "p_002", qty: 3 }
        ]
      })
    });

    assert.equal(response.status, 201);
    const payload = await response.json() as { items: Array<{ id: string; qty: number }> };
    assert.deepEqual(payload.items, [{ id: "p_002", qty: 5 }]);

    const donut = products.find((product) => product.id === "p_002");
    assert.ok(donut);
    assert.equal(donut.stock, 45);
  });
});
