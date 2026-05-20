import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "./PageLayout";
import { apiClient } from "../api/client";
import { AlertCircle, DollarSign, ReceiptText, Tag, TrendingDown, PlusCircle } from "lucide-react";

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
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState<{
    totalAmount: number;
    expenseCount: number;
    byCategory: Record<string, number>;
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    topCategories: { category: string; amount: number }[];
  } | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [items, monthly, analytic] = await Promise.all([
        apiClient.getExpenses({ search, category: category || undefined, month }),
        apiClient.getExpenseMonthlySummary(month),
        apiClient.getExpenseAnalytics(),
      ]);
      setExpenses(items);
      setSummary(monthly);
      setAnalytics(analytic);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load expenses");
    }
  };

  useEffect(() => {
    load();
  }, [search, category, month]);

  const totalVisible = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const submit = async () => {
    const payload = {
      accountId: "default-account",
      title: form.title,
      description: form.description,
      category: form.category,
      amount: Number(form.amount),
      expenseDate: `${form.expenseDate}T00:00:00.000Z`,
      createdBy: "current-user",
    };

    try {
      if (editingId) await apiClient.updateExpense(editingId, payload);
      else await apiClient.createExpense(payload);

      setForm({
        title: "",
        description: "",
        category: "Other",
        amount: "",
        expenseDate: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
      setShowForm(false);
      await load();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save expense");
    }
  };

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      description: e.description || "",
      category: e.category,
      amount: String(e.amount),
      expenseDate: e.expenseDate.slice(0, 10),
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      category: "Other",
      amount: "",
      expenseDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
  };

  const topCategory = analytics?.topCategories?.[0];

  const stats = [
    {
      icon: <DollarSign size={32} />,
      label: "Monthly Total",
      value: `₹${summary?.totalAmount?.toFixed(2) ?? "0.00"}`,
      color: "#10b981",
    },
    {
      icon: <ReceiptText size={32} />,
      label: "Expense Count",
      value: summary?.expenseCount ?? 0,
      color: "#3b82f6",
    },
    {
      icon: <TrendingDown size={32} />,
      label: "Visible Total",
      value: `₹${totalVisible.toFixed(2)}`,
      color: "#f59e0b",
    },
    {
      icon: <Tag size={32} />,
      label: "Top Category",
      value: topCategory ? `${topCategory.category} (₹${topCategory.amount.toFixed(2)})` : "N/A",
      color: "#8b5cf6",
    },
  ];

  return (
    <PageLayout title="Expenses">
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ "--stat-color": stat.color } as React.CSSProperties}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      <div className="reports-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>
          {!showForm && (
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PlusCircle size={16} />
              Add Expense
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "16px" }}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button className="btn-primary" onClick={submit}>
                {editingId ? "Update" : "Add"}
              </button>
              <button
                onClick={cancelForm}
                style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", cursor: "pointer", background: "#f3f4f6" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters + Table */}
      <div className="reports-section">
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Search title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>

        <h2>Expense Records</h2>
        <div className="report-table" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.title}</strong>
                      {e.description && (
                        <><br /><small style={{ color: "#666" }}>{e.description}</small></>
                      )}
                    </td>
                    <td>{e.category}</td>
                    <td style={{ fontWeight: "600", color: "#ef4444" }}>₹{Number(e.amount).toFixed(2)}</td>
                    <td style={{ fontSize: "12px", color: "#666" }}>{new Date(e.expenseDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => startEdit(e)}
                          style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "#f3f4f6" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.deleteExpense(e.id);
                              await load();
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Failed to delete expense");
                            }
                          }}
                          style={{ padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "#fee2e2", color: "#ef4444" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#999" }}>
                    {search || category ? "No matching expenses found" : "No expenses recorded this month"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {expenses.length > 0 && (
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
            Showing {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button className="btn-primary" onClick={load}>
          Refresh
        </button>
      </div>
    </PageLayout>
  );
}