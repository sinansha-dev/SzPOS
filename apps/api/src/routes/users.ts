import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../services/store.js";
import { requireRole, type AuthRequest } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/", requireRole(["OWNER", "ADMIN"]), async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({ where: { accountId: req.authUser!.accountId }, orderBy: { createdAt: "desc" } });
  return res.json(users.map(({ passwordHash, resetToken, resetTokenExp, ...u }) => u));
});

usersRouter.post("/", requireRole(["OWNER", "ADMIN"]), async (req: AuthRequest, res) => {
  const body = req.body as Record<string, unknown>;
  const password = String(body.password ?? "password1234");
  const user = await prisma.user.create({
    data: {
      id: `user_${Date.now()}`,
      accountId: req.authUser!.accountId,
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      username: String(body.username ?? ""),
      passwordHash: await bcrypt.hash(password, 10),
      role: (body.role as any) ?? "CASHIER",
      status: (body.status as any) ?? "ACTIVE"
    }
  });
  const { passwordHash, resetToken, resetTokenExp, ...safe } = user;
  return res.status(201).json(safe);
});

usersRouter.patch("/:id", requireRole(["OWNER", "ADMIN"]), async (req: AuthRequest, res) => {
  const body = req.body as Record<string, unknown>;
  const updated = await prisma.user.updateMany({
    where: { id: req.params.id, accountId: req.authUser!.accountId },
    data: {
      name: body.name ? String(body.name) : undefined,
      role: body.role ? (body.role as any) : undefined,
      status: body.status ? (body.status as any) : undefined,
      passwordHash: body.password ? await bcrypt.hash(String(body.password), 10) : undefined
    }
  });
  return res.json({ updated: updated.count });
});

usersRouter.delete("/:id", requireRole(["OWNER", "ADMIN"]), async (req: AuthRequest, res) => {
  const deleted = await prisma.user.deleteMany({ where: { id: req.params.id, accountId: req.authUser!.accountId } });
  return res.json({ deleted: deleted.count });
});
