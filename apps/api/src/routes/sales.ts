import { Router } from "express";
import { sales } from "../services/store.js";

export const salesRouter = Router();

salesRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const id = String(body.id ?? `sale_${Date.now()}`);

  sales[id] = { ...body, id };
  return res.status(201).json(sales[id]);
});

salesRouter.get("/:id", (req, res) => {
  const sale = sales[req.params.id];
  if (!sale) {
    return res.status(404).json({ error: "sale not found" });
  }

  return res.json(sale);
});
