import { Router } from "express";

export const syncRouter = Router();

syncRouter.post("/", (req, res) => {
  const changes = (req.body?.changes ?? []) as unknown[];

  return res.json({
    received: changes.length,
    serverTime: new Date().toISOString(),
    conflicts: []
  });
});
