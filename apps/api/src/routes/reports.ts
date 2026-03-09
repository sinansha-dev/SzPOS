import { Router } from "express";
import { sales } from "../services/store.js";

export const reportsRouter = Router();

reportsRouter.get("/", (_req, res) => {
  const list = Object.values(sales);
  const gross = list.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
  const tax = list.reduce((sum, sale) => sum + Number(sale.taxTotal ?? 0), 0);

  // Group by payment method
  const byMethod: Record<string, { count: number; amount: number }> = {
    CASH: { count: 0, amount: 0 },
    UPI: { count: 0, amount: 0 },
    CARD: { count: 0, amount: 0 }
  };

  list.forEach((sale) => {
    const method = String(sale.payment?.method ?? "CASH");
    if (!byMethod[method]) {
      byMethod[method] = { count: 0, amount: 0 };
    }
    byMethod[method].count += 1;
    byMethod[method].amount += Number(sale.total ?? 0);
  });

  res.json({
    totalSales: gross,
    totalTax: tax,
    transactionCount: list.length,
    byPaymentMethod: byMethod,
    date: new Date().toISOString().slice(0, 10)
  });
});

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
