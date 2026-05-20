/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const AUTH_STORAGE_KEY = "szpos_auth_user";

function getAuthHeaders(extra?: Record<string, string>) {
  let role = "ADMIN";
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) role = JSON.parse(raw)?.role ?? role;
  } catch {}
  return { "x-user-role": role, ...(extra ?? {}) };
}

async function apiRequest(input: string | URL, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders((init?.headers as Record<string, string> | undefined));
  return apiRequest(input, { ...init, headers });
}

export const apiClient = {
  // Products
  async getProducts(search?: string) {
    const url = new URL(`${API_BASE}/products`);
    if (search) url.searchParams.set("search", search);
    const res = await apiRequest(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async updateProduct(id: string, data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  async createProduct(data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  async deleteProduct(id: string) {
    const res = await apiRequest(`${API_BASE}/products/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await apiRequest(`${API_BASE}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async createUser(data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },

  // Sales
  async createSale(data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      let errorMessage = "Failed to create sale";
      try {
        const payload = await res.json() as { error?: string; details?: string[] };
        if (payload.error) {
          errorMessage = payload.details?.length ? `${payload.error}: ${payload.details.join(", ")}` : payload.error;
        }
      } catch {
        // keep generic fallback
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  async getSale(id: string) {
    const res = await apiRequest(`${API_BASE}/sales/${id}`);
    if (!res.ok) throw new Error("Failed to fetch sale");
    return res.json();
  },

  // Reports
  async getSalesReport() {
    const res = await apiRequest(`${API_BASE}/reports`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
  },

  async getItemWiseAnalytics() {
    const res = await apiRequest(`${API_BASE}/reports/item-wise-analytics`);
    if (!res.ok) throw new Error("Failed to fetch item-wise analytics");
    return res.json();
  },

  // Printing

  async printSaleReceipt(saleId: string) {
    const res = await apiRequest(`${API_BASE}/printing/receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saleId })
    });
    if (!res.ok) throw new Error("Failed to print sale receipt");
    return res.json();
  },

  async testPrinter() {
    const res = await apiRequest(`${API_BASE}/printing/test`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to test printer");
    return res.json();
  },

  // Inventory
  async getInventory() {
    const res = await apiRequest(`${API_BASE}/inventory`);
    if (!res.ok) throw new Error("Failed to fetch inventory");
    return res.json();
  },



  // Expenses
  async getExpenses(params?: { search?: string; category?: string; month?: string }) {
    const url = new URL(`${API_BASE}/expenses`);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.month) url.searchParams.set("month", params.month);
    const res = await apiRequest(url);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
  },

  async createExpense(data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create expense");
    return res.json();
  },

  async updateExpense(id: string, data: Record<string, unknown>) {
    const res = await apiRequest(`${API_BASE}/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update expense");
    return res.json();
  },

  async deleteExpense(id: string) {
    const res = await apiRequest(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete expense");
    return res.json();
  },

  async getExpenseMonthlySummary(month?: string) {
    const url = new URL(`${API_BASE}/expenses/summary/monthly`);
    if (month) url.searchParams.set("month", month);
    const res = await apiRequest(url);
    if (!res.ok) throw new Error("Failed to fetch monthly expense summary");
    return res.json();
  },

  async getExpenseAnalytics() {
    const res = await apiRequest(`${API_BASE}/expenses/analytics`);
    if (!res.ok) throw new Error("Failed to fetch expense analytics");
    return res.json();
  },

  async resetPOS(password: string) {
    const res = await apiRequest(`${API_BASE}/auth/reset-pos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error((payload as { error?: string }).error || "Failed to reset POS");
    }
    return res.json();
  },

  async updateInventory(productId: string, quantity: number) {
    const res = await apiRequest(`${API_BASE}/inventory/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error("Failed to update inventory");
    return res.json();
  }
};
