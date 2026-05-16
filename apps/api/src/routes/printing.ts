import { Router } from "express";
import { prisma } from "../services/store.js";
import { printReceipt, printTest } from "../services/thermalPrinter.js";

export const printingRouter = Router();

// Print receipt for a specific sale
printingRouter.post("/receipt", async (req, res) => {
  try {
    const saleId = req.body?.saleId;
    if (!saleId) {
      return res.status(400).json({ error: "saleId is required" });
    }

    // Fetch sale from database
    const sale = await prisma.sale.findUnique({
      where: { id: saleId }
    });

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // Print the receipt to thermal printer (no dialog)
    const printResult = await printReceipt(sale.payload);
    return res.json(printResult);
  } catch (error) {
    console.error("Print receipt error:", error);
    return res.status(500).json({ error: "Failed to print receipt" });
  }
});

// Test printer connection
printingRouter.post("/test", async (req, res) => {
  try {
    const result = await printTest();
    return res.json(result);
  } catch (error) {
    console.error("Print test error:", error);
    return res.status(500).json({ error: "Print test failed" });
  }
});
