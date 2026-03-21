import { Router } from "express";
import { prisma } from "../services/store.js";

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

salesRouter.post("/", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const items = parseItems(body.items);

    if (items.length === 0) {
      return res.status(400).json({ error: "Sale must include at least one valid item" });
    }

    // Check stock for all items
    const stockErrors: string[] = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        stockErrors.push(`Product ${item.id} not found`);
      } else if (item.qty > product.stock) {
        stockErrors.push(`${product.name} has only ${product.stock} in stock`);
      }
    }

    if (stockErrors.length > 0) {
      return res.status(409).json({ error: "Insufficient stock", details: stockErrors });
    }

    // Update stock for all items
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.qty } }
      });
    }

    // Create sale record
    const saleData = {
      id: String(body.id ?? `sale_${Date.now()}`),
      payload: {
        ...body,
        items,
        stockUpdatedAt: new Date().toISOString()
      }
    };

    const sale = await prisma.sale.create({
      data: saleData
    });

    return res.status(201).json(sale);
  } catch (error) {
    console.error("Sale creation error:", error);
    return res.status(500).json({ error: "Failed to create sale" });
  }
});

salesRouter.get("/:id", async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id }
    });

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    return res.json(sale);
  } catch (error) {
    console.error("Sale fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch sale" });
  }
});

salesRouter.get("/", async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(sales);
  } catch (error) {
    console.error("Sales fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch sales" });
  }
});
