import { Router } from "express";
import { products } from "../services/store.js";

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const search = String(req.query.search ?? "").toLowerCase();
  const filtered = products.filter((product) =>
    [product.name, product.sku].join(" ").toLowerCase().includes(search)
  );

  return res.json(filtered);
});

productsRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const id = String(body.id ?? `product_${Date.now()}`);

  const newProduct = {
    id,
    name: String(body.name ?? ""),
    sku: String(body.sku ?? ""),
    stock: Number(body.stock ?? 0),
    price: Number(body.price ?? 0),
    taxRate: Number(body.taxRate ?? 0.05)
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

productsRouter.put("/:id", (req, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const body = req.body as Record<string, unknown>;
  const updated = {
    ...products[productIndex],
    ...(body.name && { name: String(body.name) }),
    ...(body.sku && { sku: String(body.sku) }),
    ...(body.stock !== undefined && { stock: Number(body.stock) }),
    ...(body.price !== undefined && { price: Number(body.price) }),
    ...(body.taxRate !== undefined && { taxRate: Number(body.taxRate) })
  };

  products[productIndex] = updated;
  return res.json(updated);
});

productsRouter.delete("/:id", (req, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deleted = products.splice(productIndex, 1);
  return res.json(deleted[0]);
});
