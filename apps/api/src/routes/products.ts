import { Router } from "express";
import { prisma } from "../services/store.js";
import type { AuthRequest } from "../middleware/auth.js";

export const productsRouter = Router();

productsRouter.get("/", async (req: AuthRequest, res) => {
  const search = String(req.query.search ?? "").toLowerCase();
  const products = await prisma.product.findMany({
    where: { accountId: req.authUser!.accountId, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] } : {}) }
  });
  return res.json(products);
});

productsRouter.post("/", async (req: AuthRequest, res) => {
  const body = req.body as Record<string, unknown>;
  const newProduct = await prisma.product.create({
    data: { id: String(body.id ?? `product_${Date.now()}`), accountId: req.authUser!.accountId, name: String(body.name ?? ""), sku: String(body.sku ?? ""), stock: Number(body.stock ?? 0), price: Number(body.price ?? 0), taxRate: Number(body.taxRate ?? 0.05) }
  });
  return res.status(201).json(newProduct);
});
