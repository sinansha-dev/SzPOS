import { Router } from "express";
import { prisma } from "../services/store.js";

export const inventoryRouter = Router();

inventoryRouter.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(products);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

inventoryRouter.get("/low-stock", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lte: 20 } },
      orderBy: { stock: 'asc' }
    });
    return res.json(products);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return res.status(500).json({ error: "Failed to fetch low stock items" });
  }
});

inventoryRouter.put("/:id", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: Number(body.quantity ?? body.stock ?? 0)
      }
    });

    return res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Error updating inventory:", error);
    return res.status(500).json({ error: "Failed to update inventory" });
  }
});
