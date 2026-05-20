import { hasPermission, Permission } from "./permissions";

export type NavItem = { title: string; path: string; permission: Permission };

export const NAV_ITEMS: NavItem[] = [
  { title: "Point of Sale", path: "/sales", permission: "sales:view" },
  { title: "Sales Orders", path: "/sales-orders", permission: "salesOrders:view" },
  { title: "Reports & Analytics", path: "/reports", permission: "reports:view" },
  { title: "Inventory", path: "/inventory", permission: "inventory:view" },
  { title: "Expenses", path: "/expenses", permission: "expenses:view" },
  { title: "Users", path: "/users", permission: "users:view" },
  { title: "Settings", path: "/settings", permission: "settings:view" }
];

export function getAllowedNav(role?: string) {
  return NAV_ITEMS.filter((item) => hasPermission(role, item.permission));
}
