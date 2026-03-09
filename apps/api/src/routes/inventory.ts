import { Router } from "express";
import { products } from "../services/store.js";

export const inventoryRouter = Router();

inventoryRouter.get("/", (_req, res) => {
  return res.json(products);
});

inventoryRouter.get("/low-stock", (_req, res) => {
  return res.json(products.filter((product) => product.stock <= 20));
});

inventoryRouter.put("/:id", (req, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const body = req.body as Record<string, unknown>;
  const product = products[productIndex];
  const updated = {
    ...product,
    stock: Number(body.quantity ?? product.stock)
  };

  products[productIndex] = updated;
  return res.json(updated);
});
