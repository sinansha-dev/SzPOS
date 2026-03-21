import { Router } from "express";
import { prisma } from "../services/store.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  try {
    const search = String(req.query.search ?? "").toLowerCase();
    const products = await prisma.product.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined
    });

    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

productsRouter.post("/", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const id = String(body.id ?? `product_${Date.now()}`);

    const newProduct = await prisma.product.create({
      data: {
        id,
        name: String(body.name ?? ""),
        sku: String(body.sku ?? ""),
        stock: Number(body.stock ?? 0),
        price: Number(body.price ?? 0),
        taxRate: Number(body.taxRate ?? 0.05)
      }
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

productsRouter.put("/:id", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: body.name ? String(body.name) : undefined,
        sku: body.sku ? String(body.sku) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        taxRate: body.taxRate !== undefined ? Number(body.taxRate) : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Failed to update product" });
  }
});

productsRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.product.delete({
      where: { id: req.params.id }
    });

    return res.json(deleted);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});
