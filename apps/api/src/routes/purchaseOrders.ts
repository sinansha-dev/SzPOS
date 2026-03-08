import { Router } from "express";
import { purchaseOrders } from "../services/store.js";

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.post("/", (req, res) => {
  const id = `po_${Date.now()}`;
  purchaseOrders[id] = { id, ...req.body, status: req.body?.status ?? "created" };
  res.status(201).json(purchaseOrders[id]);
});

purchaseOrdersRouter.get("/", (_req, res) => {
  res.json(Object.values(purchaseOrders));
});
