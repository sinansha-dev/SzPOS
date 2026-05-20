import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "./PageLayout";
import { apiClient } from "../api/client";

const CATEGORIES = ["Rent", "Salary", "Electricity", "Water", "Internet", "Supplies", "Maintenance", "Marketing", "Other"];

type Expense = {
  id: string;
  accountId: string;
  title: string;
  description?: string | null;
  category: string;
  amount: number;
  expenseDate: string;
  createdBy: string;
  createdAt: string;
};

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ title: "", description: "", category: "Other", amount: "", expenseDate: new Date().toISOString().slice(0, 10) });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ totalAmount: number; expenseCount: number; byCategory: Record<string, number> } | null>(null);
  const [analytics, setAnalytics] = useState<{ topCategories: { category: string; amount: number }[] } | null>(null);

  const load = async () => {
    const [items, monthly, analytic] = await Promise.all([
      apiClient.getExpenses({ search, category: category || undefined, month }),
      apiClient.getExpenseMonthlySummary(month),
      apiClient.getExpenseAnalytics()
    ]);
    setExpenses(items);
    setSummary(monthly);
    setAnalytics(analytic);
  };

  useEffect(() => { load(); }, [search, category, month]);

  const totalVisible = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);

  const submit = async () => {
    const payload = {
      accountId: "default-account",
      title: form.title,
      description: form.description,
      category: form.category,
      amount: Number(form.amount),
      expenseDate: `${form.expenseDate}T00:00:00.000Z`,
      createdBy: "current-user"
    };

    if (editingId) await apiClient.updateExpense(editingId, payload);
    else await apiClient.createExpense(payload);

    setForm({ title: "", description: "", category: "Other", amount: "", expenseDate: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    await load();
  };

  return <PageLayout title="Expenses">
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Search title/description" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All Categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <input placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
        </div>
        <button onClick={submit}>{editingId ? "Update" : "Add"} Expense</button>
      </div>

      <div>
        <p><strong>Monthly Summary:</strong> {summary?.expenseCount ?? 0} expenses | ${summary?.totalAmount?.toFixed?.(2) ?? "0.00"}</p>
        <p><strong>Visible Total:</strong> ${totalVisible.toFixed(2)}</p>
        <p><strong>Top Categories:</strong> {(analytics?.topCategories ?? []).map((c) => `${c.category} ($${c.amount.toFixed(2)})`).join(", ") || "N/A"}</p>
      </div>

      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>{expenses.map((e) => <tr key={e.id}><td>{e.title}<br /><small>{e.description}</small></td><td>{e.category}</td><td>${Number(e.amount).toFixed(2)}</td><td>{new Date(e.expenseDate).toLocaleDateString()}</td><td><button onClick={() => { setEditingId(e.id); setForm({ title: e.title, description: e.description || "", category: e.category, amount: String(e.amount), expenseDate: e.expenseDate.slice(0, 10) }); }}>Edit</button> <button onClick={async () => { await apiClient.deleteExpense(e.id); await load(); }}>Delete</button></td></tr>)}</tbody>
      </table>
    </div>
  </PageLayout>;
}
