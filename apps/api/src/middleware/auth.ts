import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  accountId: string;
  role: "OWNER" | "ADMIN" | "CASHIER" | "KITCHEN" | "VIEWER";
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  authUser?: AuthUser;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = header.slice(7);
  const secret = process.env.JWT_SECRET || "dev-secret";
  try {
    req.authUser = jwt.verify(token, secret) as AuthUser;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(roles: AuthUser["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.authUser.role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
