import { Router } from "express";
import { products, sales } from "../services/store.js";

type SaleItem = { id: string; qty: number };

function parseItems(raw: unknown): SaleItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => item as Record<string, unknown>)
    .map((item) => ({
      id: String(item.id ?? ""),
      qty: Number(item.qty ?? 0)
    }))
    .filter((item) => item.id && Number.isFinite(item.qty) && item.qty > 0);
}

export const salesRouter = Router();

salesRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const items = parseItems(body.items);

  if (items.length === 0) {
    return res.status(400).json({ error: "Sale must include at least one valid item" });
  }

  const stockErrors = items
    .map((item) => {
      const product = products.find((productRow) => productRow.id === item.id);
      if (!product) {
        return `Product ${item.id} not found`;
      }
      if (item.qty > product.stock) {
        return `${product.name} has only ${product.stock} in stock`;
      }
      return null;
    })
    .filter((errorText): errorText is string => Boolean(errorText));

  if (stockErrors.length > 0) {
    return res.status(409).json({ error: "Insufficient stock", details: stockErrors });
  }

  for (const item of items) {
    const product = products.find((productRow) => productRow.id === item.id);
    if (product) {
      product.stock -= item.qty;
    }
  }

  const id = String(body.id ?? `sale_${Date.now()}`);
  sales[id] = {
    ...body,
    id,
    stockUpdatedAt: new Date().toISOString()
  };

  return res.status(201).json(sales[id]);
});

salesRouter.get("/:id", (req, res) => {
  const sale = sales[req.params.id];
  if (!sale) {
    return res.status(404).json({ error: "sale not found" });
  }

  return res.json(sale);
});
