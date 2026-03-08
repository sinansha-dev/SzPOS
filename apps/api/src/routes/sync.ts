import { Router } from "express";

export const syncRouter = Router();

type Change = {
  id: string;
  entity: "sale" | "inventory";
  operation: "create" | "update";
  payload: Record<string, unknown>;
  timestamp: string;
};

syncRouter.post("/", (req, res) => {
  const changes = (req.body?.changes ?? []) as Change[];

  const conflicts = changes
    .filter((item) => item.entity === "inventory" && item.operation === "update")
    .map((item) => ({ changeId: item.id, reason: "inventory requires server-authoritative merge" }));

  return res.json({
    received: changes.length,
    accepted: changes.length - conflicts.length,
    conflicts,
    serverTime: new Date().toISOString()
  });
});
