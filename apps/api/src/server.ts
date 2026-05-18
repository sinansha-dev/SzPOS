import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
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
import { requireAuth } from "./middleware/auth.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use("/api/auth", authRouter);
app.use("/api", requireAuth);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/printing", printingRouter);
app.use("/api/sync", syncRouter);
app.use("/api/users", usersRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

async function start() {
  try { await initializeDatabase(); } catch {}
  try { await initializePrinter(); } catch {}
  app.listen(port, () => console.log(`🚀 API listening on http://localhost:${port}`));
}
start();
