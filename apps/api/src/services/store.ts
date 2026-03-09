export type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  taxRate: number;
  stock: number;
  reorderLevel: number;
};

export const products: ProductRecord[] = [
  { id: "p_001", sku: "CAKE-001", name: "Chocolate Cake", category: "Bakery", price: 120, taxRate: 0.05, stock: 12, reorderLevel: 20 },
  { id: "p_002", sku: "DNT-001", name: "Donut", category: "Bakery", price: 40, taxRate: 0.05, stock: 50, reorderLevel: 25 },
  { id: "p_003", sku: "CKI-001", name: "Cookie", category: "Snacks", price: 30, taxRate: 0.05, stock: 80, reorderLevel: 30 },
  { id: "p_004", sku: "BRW-001", name: "Brownie", category: "Dessert", price: 60, taxRate: 0.05, stock: 18, reorderLevel: 20 }
];

export const sales: Record<string, Record<string, unknown>> = {};

export const returns: Record<string, Record<string, unknown>> = {};

export const purchaseOrders: Record<string, Record<string, unknown>> = {};

export const users = [
  { id: "user_01", name: "Admin", role: "admin", email: "admin@szpos.local" },
  { id: "user_02", name: "Cashier", role: "cashier", email: "cashier@szpos.local" }
];
