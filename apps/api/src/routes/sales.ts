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
      id: String(item.id ?? "").trim(),
      qty: Number(item.qty ?? 0)
    }))
    .filter((item) => item.id.length > 0 && Number.isInteger(item.qty) && item.qty > 0);
}

function normalizeItems(items: SaleItem[]): SaleItem[] {
  const aggregated = new Map<string, number>();

  for (const item of items) {
    aggregated.set(item.id, (aggregated.get(item.id) ?? 0) + item.qty);
  }

  return [...aggregated.entries()].map(([id, qty]) => ({ id, qty }));
}

export const salesRouter = Router();

salesRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const parsedItems = parseItems(body.items);
  const items = normalizeItems(parsedItems);

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
    items,
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
