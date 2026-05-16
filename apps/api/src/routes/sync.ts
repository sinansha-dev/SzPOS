import { Router } from "express";
import { getISTTimestamp } from "../utils/timezone.js";

export const syncRouter = Router();

syncRouter.post("/", (req, res) => {
  const changes = (req.body?.changes ?? []) as unknown[];

  return res.json({
    received: changes.length,
    serverTime: getISTTimestamp(),
    conflicts: []
  });
});
