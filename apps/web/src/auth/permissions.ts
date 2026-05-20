export const ROLES = ["OWNER", "ADMIN", "CASHIER", "KITCHEN", "VIEWER"] as const;
export type AppRole = (typeof ROLES)[number];

export const PERMISSIONS = {
  "sales:view": ["OWNER", "ADMIN", "CASHIER"],
  "sales:print": ["OWNER", "ADMIN", "CASHIER"],
  "salesOrders:view": ["OWNER", "ADMIN", "CASHIER", "KITCHEN"],
  "salesOrders:manage": ["OWNER", "ADMIN", "CASHIER"],
  "reports:view": ["OWNER", "ADMIN", "VIEWER"],
  "inventory:view": ["OWNER", "ADMIN"],
  "inventory:manage": ["OWNER", "ADMIN"],
  "users:view": ["OWNER", "ADMIN"],
  "users:manage": ["OWNER", "ADMIN"],
  "settings:view": ["OWNER", "ADMIN"],
  "expenses:view": ["OWNER", "ADMIN"],
  "expenses:manage": ["OWNER", "ADMIN"],
  "dashboard:view": ["OWNER", "ADMIN", "CASHIER", "KITCHEN", "VIEWER"]
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: AppRole | string | undefined, permission: Permission) {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}
