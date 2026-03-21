import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { salesRouter } from "./sales.js";
import { prisma } from "../services/store.js";

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
    assert.ok(payload.details?.some((detail) => detail.includes("has only")));
  });
});

test("decrements stock for successful sale", async () => {
  // Get current stock before sale
  const donutBefore = await prisma.product.findUnique({ where: { id: "p_002" } });
  const stockBefore = donutBefore?.stock ?? 0;

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `sale_ok_${Date.now()}`,
        items: [{ id: "p_002", qty: 2 }]
      })
    });

    assert.equal(response.status, 201);
    const payload = await response.json() as any;
    assert.ok(payload.id);

    // Verify stock was decremented in database
    const donutAfter = await prisma.product.findUnique({ where: { id: "p_002" } });
    assert.equal(donutAfter?.stock, stockBefore - 2);
  });
});
