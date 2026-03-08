import { Router } from "express";
import { returns } from "../services/store.js";

export const returnsRouter = Router();

returnsRouter.post("/", (req, res) => {
  const id = `ret_${Date.now()}`;
  returns[id] = { id, ...req.body, status: "approved" };
  res.status(201).json(returns[id]);
});

returnsRouter.get("/:id", (req, res) => {
  const ret = returns[req.params.id];
  if (!ret) {
    return res.status(404).json({ error: "return not found" });
  }

  return res.json(ret);
});
