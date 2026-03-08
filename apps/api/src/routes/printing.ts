import { Router } from "express";

export const printingRouter = Router();

printingRouter.post("/receipt", (req, res) => {
  const saleId = req.body?.saleId;
  if (!saleId) {
    return res.status(400).json({ error: "saleId is required" });
  }

  return res.json({
    saleId,
    transport: req.body?.transport ?? "network",
    printerIp: req.body?.printerIp ?? "192.168.1.50",
    status: "queued"
  });
});
