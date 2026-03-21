import { Router } from "express";
import { prisma } from "../services/store.js";

export const reportsRouter = Router();

reportsRouter.get("/", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    const list = sales.map(sale => sale.payload as Record<string, unknown>);

    const gross = list.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
    const tax = list.reduce((sum, sale) => sum + Number(sale.taxTotal ?? 0), 0);

    const byMethod: Record<string, { count: number; amount: number }> = {
      CASH: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      CARD: { count: 0, amount: 0 }
    };

    list.forEach((sale) => {
      const payment = sale.payment as { method?: string } | undefined;
      const method = String(payment?.method ?? "CASH");
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
  } catch (error) {
    console.error("Error generating reports:", error);
    return res.status(500).json({ error: "Failed to generate reports" });
  }
});

reportsRouter.get("/daily-sales", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    const list = sales.map(sale => sale.payload as Record<string, unknown>);

    const gross = list.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
    const tax = list.reduce((sum, sale) => sum + Number(sale.taxTotal ?? 0), 0);

    res.json({
      date: new Date().toISOString().slice(0, 10),
      billCount: list.length,
      gross,
      tax,
      net: gross - tax
    });
  } catch (error) {
    console.error("Error generating daily sales report:", error);
    return res.status(500).json({ error: "Failed to generate daily sales report" });
  }
});
