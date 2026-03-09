export const products = [
  { id: "p_001", sku: "CAKE-001", name: "Chocolate Cake", price: 120, taxRate: 0.05, stock: 12 },
  { id: "p_002", sku: "DNT-001", name: "Donut", price: 40, taxRate: 0.05, stock: 50 },
  { id: "p_003", sku: "CKI-001", name: "Cookie", price: 30, taxRate: 0.05, stock: 80 },
  { id: "p_004", sku: "BRW-001", name: "Brownie", price: 60, taxRate: 0.05, stock: 25 }
];

export const users = [
  { id: "u_001", name: "Admin User", username: "admin", role: "admin", status: "active" },
  { id: "u_002", name: "John Cashier", username: "john", role: "cashier", status: "active" },
  { id: "u_003", name: "Jane Manager", username: "jane", role: "manager", status: "active" }
];

export const sales: Record<string, unknown> = {};
