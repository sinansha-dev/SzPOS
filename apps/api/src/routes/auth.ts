import { Router } from "express";
import { prisma } from "../services/store.js";

export const authRouter = Router();

// Default reset password for development
const RESET_PASSWORD = process.env.RESET_PASSWORD || "admin123";

authRouter.post("/login", (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  return res.json({
    accessToken: "dev-access-token",
    refreshToken: "dev-refresh-token",
    user: {
      id: "user_01",
      name: "Admin",
      role: "admin",
      email
    }
  });
});

authRouter.post("/reset-pos", async (req, res) => {
  try {
    const { password } = req.body as { password?: string };

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (password !== RESET_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Delete all transactional data
    await prisma.sale.deleteMany();
    await prisma.return.deleteMany();
    await prisma.purchaseOrder.deleteMany();

    // Reset inventory to initial values
    const initialStocks: Record<string, number> = {
      "p_001": 12,  // Chocolate Cake
      "p_002": 50,  // Donut
      "p_003": 80,  // Cookie
      "p_004": 25   // Brownie
    };

    for (const [productId, stock] of Object.entries(initialStocks)) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock }
      });
    }

    return res.json({
      success: true,
      message: "POS has been reset successfully",
      resetData: {
        salesCleared: true,
        returnsCleared: true,
        purchaseOrdersCleared: true,
        inventoryReset: true
      }
    });
  } catch (error) {
    console.error("Error resetting POS:", error);
    return res.status(500).json({ error: "Failed to reset POS" });
  }
});
