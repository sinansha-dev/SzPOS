import { Router } from "express";
import { users } from "../services/store.js";

export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.json(users);
});

usersRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const id = String(body.id ?? `user_${Date.now()}`);

  const newUser = {
    id,
    name: String(body.name ?? ""),
    username: String(body.username ?? ""),
    role: String(body.role ?? "cashier") as "admin" | "cashier" | "manager",
    status: String(body.status ?? "active") as "active" | "inactive"
  };

  users.push(newUser);
  return res.status(201).json(newUser);
});

usersRouter.put("/:id", (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const body = req.body as Record<string, unknown>;
  const current = users[userIndex];
  const updated = {
    ...current,
    name: body.name ? String(body.name) : current.name,
    username: body.username ? String(body.username) : current.username,
    role: body.role ? String(body.role) : current.role,
    status: body.status ? String(body.status) : current.status
  };

  users[userIndex] = updated;
  return res.json(updated);
});

usersRouter.delete("/:id", (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const deleted = users.splice(userIndex, 1);
  return res.json(deleted[0]);
});
