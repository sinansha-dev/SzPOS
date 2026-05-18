import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../services/store.js";
import type { AuthUser } from "../middleware/auth.js";

export const authRouter = Router();

function sign(user: AuthUser) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(user, secret, { expiresIn: "8h" });
}

authRouter.post("/signup", async (req, res) => {
  const { businessName, email, username, password, name } = req.body as Record<string, string>;
  if (!businessName || !email || !username || !password || !name) return res.status(400).json({ error: "Missing fields" });

  const accountId = `acct_${Date.now()}`;
  const userId = `user_${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({ data: { id: accountId, businessName, email, subscriptionPlan: "starter" } });
    const user = await tx.user.create({ data: { id: userId, accountId, name, email, username, passwordHash, role: "OWNER", status: "ACTIVE" } });
    return { account, user };
  });

  const payload: AuthUser = { id: result.user.id, accountId: result.account.id, role: result.user.role as AuthUser["role"], email: result.user.email, name: result.user.name };
  return res.status(201).json({ accessToken: sign(payload), user: payload, account: result.account });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user || user.status !== "ACTIVE") return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const payload: AuthUser = { id: user.id, accountId: user.accountId, role: user.role as AuthUser["role"], email: user.email, name: user.name };
  return res.json({ accessToken: sign(payload), user: payload });
});

authRouter.post("/logout", (_req, res) => res.json({ success: true }));

authRouter.post("/reset-password-request", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const token = crypto.randomBytes(24).toString("hex");
  await prisma.user.updateMany({ where: { email }, data: { resetToken: token, resetTokenExp: new Date(Date.now() + 1000 * 60 * 15) } });
  return res.json({ success: true, resetToken: token });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token || !newPassword) return res.status(400).json({ error: "token and newPassword required" });
  const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExp: { gt: new Date() } } });
  if (!user) return res.status(400).json({ error: "invalid token" });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExp: null } });
  return res.json({ success: true });
});
