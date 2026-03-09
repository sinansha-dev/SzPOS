/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const apiClient = {
  // Products
  async getProducts(search?: string) {
    const url = new URL(`${API_BASE}/products`);
    if (search) url.searchParams.set("search", search);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  async createProduct(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async createUser(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },

  // Sales
  async createSale(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create sale");
    return res.json();
  },

  async getSale(id: string) {
    const res = await fetch(`${API_BASE}/sales/${id}`);
    if (!res.ok) throw new Error("Failed to fetch sale");
    return res.json();
  },

  // Reports
  async getSalesReport() {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
  },

  // Inventory
  async getInventory() {
    const res = await fetch(`${API_BASE}/inventory`);
    if (!res.ok) throw new Error("Failed to fetch inventory");
    return res.json();
  },

  async updateInventory(productId: string, quantity: number) {
    const res = await fetch(`${API_BASE}/inventory/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error("Failed to update inventory");
    return res.json();
  }
};
