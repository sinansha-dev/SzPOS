import { useEffect, useState } from "react";
import { PageLayout } from "./PageLayout";
import { TrendingUp, DollarSign, Package, Users, AlertCircle } from "lucide-react";
import { apiClient } from "../api/client";

export function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSalesReport();
      setReport(data);
      setError("");
    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Reports & Analytics">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      </PageLayout>
    );
  }

  const stats = [
    {
      icon: <DollarSign size={32} />,
      label: "Total Sales",
      value: report ? `₹${report.totalSales?.toFixed(2)}` : "₹0.00",
      color: "#10b981"
    },
    {
      icon: <TrendingUp size={32} />,
      label: "Transactions",
      value: report?.transactionCount || "0",
      color: "#3b82f6"
    },
    {
      icon: <Package size={32} />,
      label: "Total Tax",
      value: report ? `₹${report.totalTax?.toFixed(2)}` : "₹0.00",
      color: "#f59e0b"
    },
    {
      icon: <Users size={32} />,
      label: "Net Amount",
      value: report ? `₹${((report.totalSales || 0) - (report.totalTax || 0)).toFixed(2)}` : "₹0.00",
      color: "#8b5cf6"
    }
  ];

  return (
    <PageLayout title="Reports & Analytics">
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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

      <div className="reports-section">
        <h2>Sales by Payment Method</h2>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Amount (₹)</th>
                <th>Transactions</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {report?.byPaymentMethod ? (
                Object.entries(report.byPaymentMethod).map(([method, data]: [string, any]) => {
                  const percentage =
                    report.totalSales > 0 ? ((data.amount / report.totalSales) * 100).toFixed(1) : "0";
                  return (
                    <tr key={method}>
                      <td><strong>{method}</strong></td>
                      <td>₹{data.amount.toFixed(2)}</td>
                      <td>{data.count}</td>
                      <td>{percentage}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button className="btn-primary" onClick={loadReports}>
          Refresh Reports
        </button>
      </div>
    </PageLayout>
  );
}
