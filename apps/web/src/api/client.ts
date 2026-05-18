/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("szpos_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) } });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

export const apiClient = {
  login: (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (payload: Record<string, unknown>) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getProducts: (search?: string) => request(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createProduct: (data: Record<string, unknown>) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  getUsers: () => request("/users"),
  createUser: (data: Record<string, unknown>) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: Record<string, unknown>) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  createSale: (data: Record<string, unknown>) => request("/sales", { method: "POST", body: JSON.stringify(data) }),
  getSale: (id: string) => request(`/sales/${id}`),
  getSalesReport: () => request("/reports"),
  getItemWiseAnalytics: () => request("/reports/item-wise-analytics"),
  printSaleReceipt: (saleId: string) => request("/printing/receipt", { method: "POST", body: JSON.stringify({ saleId }) }),
  testPrinter: () => request("/printing/test", { method: "POST" }),
  getInventory: () => request("/inventory"),
  resetPOS: (password: string) => request("/auth/reset-pos", { method: "POST", body: JSON.stringify({ password }) }),
  updateInventory: (productId: string, quantity: number) => request(`/inventory/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) })
};
