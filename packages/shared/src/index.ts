export type Role = "admin" | "cashier" | "kitchen";

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export interface Store {
  id: string;
  name: string;
  timezone: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  taxRate: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  priceDelta: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

export interface Sale {
  id: string;
  storeId: string;
  userId: string;
  timestamp: string;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  payment: {
    method: "CASH" | "UPI" | "CARD";
    amount: number;
  };
  printStatus: "not_printed" | "printed" | "failed";
}

export interface PrinterConfig {
  mode: "network" | "webusb" | "bluetooth";
  ip?: string;
  port?: number;
  autoPrintReceipt: boolean;
  autoPrintKitchen: boolean;
}
