import { Router } from "express";
import { prisma } from "../services/store.js";
import { getISTDateString } from "../utils/timezone.js";

export const reportsRouter = Router();

reportsRouter.get("/", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    const list = sales.map((sale: { payload: unknown }) => sale.payload as Record<string, unknown>);

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
      date: getISTDateString()
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return res.status(500).json({ error: "Failed to generate reports" });
  }
});

reportsRouter.get("/daily-sales", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    const list = sales.map((sale: { payload: unknown }) => sale.payload as Record<string, unknown>);

    const gross = list.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
    const tax = list.reduce((sum, sale) => sum + Number(sale.taxTotal ?? 0), 0);

    res.json({
      date: getISTDateString(),
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

// Item-wise analytics endpoint
reportsRouter.get("/item-wise-analytics", async (_req, res) => {
  try {
    // Fetch all products and sales
    const products = await prisma.product.findMany();
    const sales = await prisma.sale.findMany();

    // Create product map for quick lookup
    const productMap = new Map(products.map((p: { id: string; name?: string; sku?: string }) => [p.id, p]));

    // Aggregate sales by item
    const itemAnalytics: Record<string, {
      productId: string;
      productName: string;
      sku: string;
      totalQuantitySold: number;
      totalRevenue: number;
      totalTax: number;
      unitPrice: number;
      taxRate: number;
      averageUnitPrice: number;
      profitMargin: number;
      timesInTransaction: number;
      lastSoldDate: string;
    }> = {};

    sales.forEach((sale: { payload: unknown }) => {
      const payload = sale.payload as Record<string, unknown>;
      const items = (payload.items as unknown[]) ?? [];
      const saleItems = items.map((item: unknown) => item as Record<string, unknown>);
      const saleDate = String(payload.timestamp ?? getISTDateString());

      saleItems.forEach((saleItem) => {
        const itemId = String(saleItem.id ?? "");
        const itemQty = Number(saleItem.qty ?? 0);
        const itemPrice = Number(saleItem.price ?? 0);
        const itemTaxRate = Number(saleItem.taxRate ?? 0);
        const itemName = String(saleItem.name ?? "").trim();

        if (!itemId || !itemQty) return;

        // Calculate tax for this item
        const itemTaxAmount = itemPrice * itemQty * itemTaxRate;

        if (!itemAnalytics[itemId]) {
          const product = productMap.get(itemId);
          // Use sale item name if available, otherwise fall back to product name from DB
          const finalName = itemName && itemName.length > 0 
            ? itemName 
            : (product?.name ?? "Unknown");
          
          itemAnalytics[itemId] = {
            productId: itemId,
            productName: finalName,
            sku: product?.sku ?? "N/A",
            totalQuantitySold: 0,
            totalRevenue: 0,
            totalTax: 0,
            unitPrice: itemPrice,
            taxRate: itemTaxRate,
            averageUnitPrice: itemPrice,
            profitMargin: 0,
            timesInTransaction: 0,
            lastSoldDate: saleDate
          };
        }

        itemAnalytics[itemId].totalQuantitySold += itemQty;
        itemAnalytics[itemId].totalRevenue += itemPrice * itemQty;
        itemAnalytics[itemId].totalTax += itemTaxAmount;
        itemAnalytics[itemId].averageUnitPrice = itemAnalytics[itemId].totalRevenue / itemAnalytics[itemId].totalQuantitySold;
        itemAnalytics[itemId].timesInTransaction += 1;
        itemAnalytics[itemId].lastSoldDate = saleDate;
      });
    });

    // Convert to array and sort by revenue
    const analyticsArray = Object.values(itemAnalytics)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate summary statistics
    const totalItemRevenue = analyticsArray.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalItemsCount = analyticsArray.length;
    const topSellingItem = analyticsArray[0];
    const topSellingByQuantity = [...analyticsArray].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)[0];

    res.json({
      date: getISTDateString(),
      summary: {
        totalItemsInCatalog: products.length,
        itemsWithSales: totalItemsCount,
        totalItemRevenue,
        totalItemsQuantitySold: analyticsArray.reduce((sum, item) => sum + item.totalQuantitySold, 0),
        topSellingByRevenue: topSellingItem?.productName,
        topSellingByQuantity: topSellingByQuantity?.productName
      },
      items: analyticsArray.map((item) => ({
        ...item,
        profitMargin: item.unitPrice > 0 ? Math.round(((item.averageUnitPrice - item.unitPrice) / item.unitPrice) * 100) : 0
      }))
    });
  } catch (error) {
    console.error("Error generating item-wise analytics:", error);
    return res.status(500).json({ error: "Failed to generate item-wise analytics" });
  }
});


reportsRouter.get("/expenses", async (req, res) => {
  try {
    const month = String(req.query.month ?? "").trim();
    const now = new Date();
    const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const target = /^\d{4}-\d{2}$/.test(month) ? month : defaultMonth;
    const start = new Date(`${target}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const expenses = await prisma.expense.findMany({ where: { expenseDate: { gte: start, lt: end } } });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    }, {});

    res.json({ month: target, totalExpenses, expenseCount: expenses.length, byCategory });
  } catch (error) {
    console.error("Error generating expense report:", error);
    return res.status(500).json({ error: "Failed to generate expense report" });
  }
});
