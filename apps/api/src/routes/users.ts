import { Router } from "express";
import { prisma } from "../services/store.js";

export const usersRouter = Router();

const ROLE_MAP = {
  owner: "OWNER",
  admin: "ADMIN",
  cashier: "CASHIER",
  kitchen: "KITCHEN",
  viewer: "VIEWER"
} as const;

function normalizeRole(input: unknown): "OWNER" | "ADMIN" | "CASHIER" | "KITCHEN" | "VIEWER" {
  const raw = String(input ?? "CASHIER").trim();
  const upper = raw.toUpperCase();
  if (["OWNER", "ADMIN", "CASHIER", "KITCHEN", "VIEWER"].includes(upper)) return upper as any;
  return (ROLE_MAP[raw.toLowerCase() as keyof typeof ROLE_MAP] ?? "CASHIER") as any;
}


usersRouter.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

usersRouter.post("/", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const id = String(body.id ?? `user_${Date.now()}`);

    const newUser = await prisma.user.create({
      data: {
        id,
        name: String(body.name ?? ""),
        username: String(body.username ?? ""),
        role: normalizeRole(body.role),
        status: (body.status as "active" | "inactive") ?? "active"
      }
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

usersRouter.put("/:id", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: body.name ? String(body.name) : undefined,
        username: body.username ? String(body.username) : undefined,
        role: body.role ? normalizeRole(body.role) : undefined,
        status: body.status ? (body.status as "active" | "inactive") : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

usersRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.user.delete({
      where: { id: req.params.id }
    });

    return res.json(deleted);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});
