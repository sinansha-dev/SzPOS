import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { inventoryRouter } from "./routes/inventory.js";
import { printingRouter } from "./routes/printing.js";
import { productsRouter } from "./routes/products.js";
import { purchaseOrdersRouter } from "./routes/purchaseOrders.js";
import { reportsRouter } from "./routes/reports.js";
import { returnsRouter } from "./routes/returns.js";
import { salesRouter } from "./routes/sales.js";
import { syncRouter } from "./routes/sync.js";
import { usersRouter } from "./routes/users.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/sync", syncRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/returns", returnsRouter);
app.use("/api/purchase-orders", purchaseOrdersRouter);
app.use("/api/printing", printingRouter);
app.use("/api/users", usersRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "szpos-api" });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
