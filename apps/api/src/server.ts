import "dotenv/config";
import cors from "cors";
import express from "express";
import { execSync } from "node:child_process";
import { initializeDatabase } from "./services/store.js";
import { initializePrinter } from "./services/thermalPrinter.js";
import { authRouter } from "./routes/auth.js";
import { inventoryRouter } from "./routes/inventory.js";
import { productsRouter } from "./routes/products.js";
import { salesRouter } from "./routes/sales.js";
import { reportsRouter } from "./routes/reports.js";
import { printingRouter } from "./routes/printing.js";
import { syncRouter } from "./routes/sync.js";
import { usersRouter } from "./routes/users.js";
import { expensesRouter } from "./routes/expenses.js";
import { salesOrdersRouter } from "./routes/salesOrders.js";
import { authContext, requirePermission } from "./auth/authorize.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());
app.use(authContext);

app.use("/api/auth", authRouter);
app.use("/api/products", requirePermission("inventory:view"), productsRouter);
app.use("/api/sales", requirePermission("sales:view"), salesRouter);
app.use("/api/inventory", requirePermission("inventory:view"), inventoryRouter);
app.use("/api/reports", requirePermission("reports:view"), reportsRouter);
app.use("/api/printing", requirePermission("sales:print"), printingRouter);
app.use("/api/sync", syncRouter);
app.use("/api/expenses", requirePermission("expenses:view"), expensesRouter);
app.use("/api/sales-orders", requirePermission("salesOrders:view"), salesOrdersRouter);
app.use("/api/users", requirePermission("users:manage"), usersRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Start server and initialize database
async function start() {
  try {
    execSync("npx prisma db push", { stdio: "inherit", cwd: process.cwd() });
    console.log("✅ Prisma schema synced to database");
  } catch (error) {
    console.warn("⚠️  Prisma db push warning:", error instanceof Error ? error.message : error);
  }

  try {
    // Initialize database (seed if empty)
    await initializeDatabase();
    console.log("✅ Database ready");
  } catch (error) {
    console.warn("⚠️  Database initialization warning:", error instanceof Error ? error.message : error);
    console.log("ℹ️  Continuing with in-memory storage fallback");
  }

  try {
    // Initialize thermal printer
    await initializePrinter();
  } catch (error) {
    console.warn("⚠️  Thermal printer initialization warning:", error instanceof Error ? error.message : error);
    console.log("ℹ️  Printer will be unavailable but app will continue");
  }

  app.listen(port, () => {
    console.log(`🚀 API listening on http://localhost:${port}`);
  });
}

start();
