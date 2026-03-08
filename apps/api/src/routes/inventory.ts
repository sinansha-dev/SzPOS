import { Router } from "express";
import { products } from "../services/store.js";

export const inventoryRouter = Router();

inventoryRouter.get("/low-stock", (_req, res) => {
  return res.json(products.filter((product) => product.stock <= 20));
});
