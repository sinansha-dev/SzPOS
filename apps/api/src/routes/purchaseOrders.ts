import { Router } from "express";
import { prisma } from "../services/store.js";

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.post("/", async (req, res) => {
  try {
    const id = `po_${Date.now()}`;
    const payload = { id, ...req.body, status: req.body?.status ?? "created" };

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        id,
        payload
      }
    });

    return res.status(201).json(purchaseOrder.payload);
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return res.status(500).json({ error: "Failed to create purchase order" });
  }
});

purchaseOrdersRouter.get("/", async (_req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.json(purchaseOrders.map(po => po.payload));
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});
