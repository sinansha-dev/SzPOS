import { NextFunction, Request, Response } from "express";
import { hasPermission, Permission, AppRole, ROLES } from "./permissions.js";

function parseRole(input?: string): AppRole {
  if (input && ROLES.includes(input as AppRole)) return input as AppRole;
  return "ADMIN";
}

export function authContext(req: Request, _res: Response, next: NextFunction) {
  const role = parseRole(req.header("x-user-role") ?? undefined);
  (req as Request & { userRole?: AppRole }).userRole = role;
  next();
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as Request & { userRole?: AppRole }).userRole;
    if (!hasPermission(role, permission)) {
      return res.status(403).json({ error: "Forbidden", permission, role });
    }
    return next();
  };
}
