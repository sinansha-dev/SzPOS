import { Router } from "express";
import { prisma } from "../services/store.js";

export const authRouter = Router();

// Keep reset password aligned with admin login password (default: 1234)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const RESET_PASSWORD = process.env.RESET_PASSWORD || ADMIN_PASSWORD;

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  if (username.toLowerCase() === "admin" && password === ADMIN_PASSWORD) {
    return res.json({
      accessToken: "dev-access-token",
      refreshToken: "dev-refresh-token",
      user: { id: "user_admin", name: "Admin", role: "OWNER", username: "admin" }
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
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

    // Reset inventory for all products without hardcoded product ids
    await prisma.product.updateMany({
      data: { stock: 0 }
    });

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
