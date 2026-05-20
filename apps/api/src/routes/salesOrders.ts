import { Router } from "express";
import { prisma } from "../services/store.js";

export const salesOrdersRouter = Router();

salesOrdersRouter.get("/", async (_req, res) => {
  const orders = await prisma.salesOrder.findMany({ orderBy: { createdAt: "desc" } });
  res.json(orders);
});

salesOrdersRouter.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const order = await prisma.salesOrder.create({
    data: {
      id: String(body.id ?? `so_${Date.now()}`),
      status: String(body.status ?? "OPEN"),
      payload: (body.payload ?? {}) as object
    }
  });
  res.status(201).json(order);
});
