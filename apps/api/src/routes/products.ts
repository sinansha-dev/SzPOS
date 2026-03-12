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
  const current = products[productIndex];
  const updated = {
    ...current,
    name: body.name ? String(body.name) : current.name,
    sku: body.sku ? String(body.sku) : current.sku,
    stock: body.stock !== undefined ? Number(body.stock) : current.stock,
    price: body.price !== undefined ? Number(body.price) : current.price,
    taxRate: body.taxRate !== undefined ? Number(body.taxRate) : current.taxRate
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
