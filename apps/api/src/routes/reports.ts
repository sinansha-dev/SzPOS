import { Router } from "express";
import { sales } from "../services/store.js";

export const reportsRouter = Router();

reportsRouter.get("/daily-sales", (_req, res) => {
  const list = Object.values(sales);
  const gross = list.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
  const tax = list.reduce((sum, sale) => sum + Number(sale.taxTotal ?? 0), 0);

  res.json({
    date: new Date().toISOString().slice(0, 10),
    billCount: list.length,
    gross,
    tax,
    net: gross - tax
  });
});
