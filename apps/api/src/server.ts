import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { inventoryRouter } from "./routes/inventory.js";
import { productsRouter } from "./routes/products.js";
import { salesRouter } from "./routes/sales.js";
import { syncRouter } from "./routes/sync.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/sync", syncRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
