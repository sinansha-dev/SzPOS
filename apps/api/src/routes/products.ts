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
