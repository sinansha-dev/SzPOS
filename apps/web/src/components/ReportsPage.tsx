import { useEffect, useState } from "react";
import { PageLayout } from "./PageLayout";
import { TrendingUp, DollarSign, Package, Users, AlertCircle, BarChart3, TrendingDown } from "lucide-react";
import { apiClient } from "../api/client";

type SortField = "revenue" | "quantity" | "avgPrice" | "transactions";
type SortDirection = "asc" | "desc";

export function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [itemAnalytics, setItemAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "itemwise">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [salesData, analyticsData] = await Promise.all([
        apiClient.getSalesReport(),
        apiClient.getItemWiseAnalytics()
      ]);
      setReport(salesData);
      setItemAnalytics(analyticsData);
      setError("");
    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedItems = () => {
    if (!itemAnalytics?.items) return [];

    let filtered = itemAnalytics.items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) =>
        item.productName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a: any, b: any) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "revenue":
          aVal = a.totalRevenue;
          bVal = b.totalRevenue;
          break;
        case "quantity":
          aVal = a.totalQuantitySold;
          bVal = b.totalQuantitySold;
          break;
        case "avgPrice":
          aVal = a.averageUnitPrice;
          bVal = b.averageUnitPrice;
          break;
        case "transactions":
          aVal = a.timesInTransaction;
          bVal = b.timesInTransaction;
          break;
      }

      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
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

  const filteredItems = getFilteredAndSortedItems();

  return (
    <PageLayout title="Reports & Analytics">
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginBottom: "24px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "24px" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "12px 0",
            fontSize: "16px",
            fontWeight: activeTab === "overview" ? "600" : "500",
            color: activeTab === "overview" ? "#3b82f6" : "#666",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "overview" ? "3px solid #3b82f6" : "none"
          }}
        >
          <BarChart3 size={18} style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("itemwise")}
          style={{
            padding: "12px 0",
            fontSize: "16px",
            fontWeight: activeTab === "itemwise" ? "600" : "500",
            color: activeTab === "itemwise" ? "#3b82f6" : "#666",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderBottom: activeTab === "itemwise" ? "3px solid #3b82f6" : "none"
          }}
        >
          <Package size={18} style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }} />
          Item-wise Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
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
        </>
      )}

      {/* Item-wise Analytics Tab */}
      {activeTab === "itemwise" && (
        <>
          {/* Summary Stats */}
          {itemAnalytics?.summary && (
            <div className="stats-grid">
              <div
                className="stat-card"
                style={{ "--stat-color": "#10b981" } as React.CSSProperties}
              >
                <div className="stat-icon"><Package size={32} /></div>
                <div className="stat-info">
                  <p className="stat-label">Items with Sales</p>
                  <h3 className="stat-value">{itemAnalytics.summary.itemsWithSales}</h3>
                </div>
              </div>
              <div
                className="stat-card"
                style={{ "--stat-color": "#3b82f6" } as React.CSSProperties}
              >
                <div className="stat-icon"><TrendingUp size={32} /></div>
                <div className="stat-info">
                  <p className="stat-label">Items Sold (Qty)</p>
                  <h3 className="stat-value">{itemAnalytics.summary.totalItemsQuantitySold}</h3>
                </div>
              </div>
              <div
                className="stat-card"
                style={{ "--stat-color": "#f59e0b" } as React.CSSProperties}
              >
                <div className="stat-icon"><DollarSign size={32} /></div>
                <div className="stat-info">
                  <p className="stat-label">Item Revenue</p>
                  <h3 className="stat-value">₹{itemAnalytics.summary.totalItemRevenue?.toFixed(2)}</h3>
                </div>
              </div>
              <div
                className="stat-card"
                style={{ "--stat-color": "#8b5cf6" } as React.CSSProperties}
              >
                <div className="stat-icon"><TrendingDown size={32} /></div>
                <div className="stat-info">
                  <p className="stat-label">Top Item (Qty)</p>
                  <h3 className="stat-value" style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {itemAnalytics.summary.topSellingByQuantity || "N/A"}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Search and Sort Controls */}
          <div className="reports-section">
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  <option value="revenue">Sort by Revenue</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="avgPrice">Sort by Avg Price</option>
                  <option value="transactions">Sort by Frequency</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background: "#f3f4f6"
                  }}
                  title={`Sort ${sortDirection === "desc" ? "ascending" : "descending"}`}
                >
                  {sortDirection === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            <h2>Item-wise Sales Details</h2>
            <div className="report-table" style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Quantity Sold</th>
                    <th>Revenue (₹)</th>
                    <th>Avg Unit Price (₹)</th>
                    <th>Tax (₹)</th>
                    <th>Times Sold</th>
                    <th>Last Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td><strong>{item.productName}</strong></td>
                        <td style={{ fontSize: "12px", color: "#666" }}>{item.sku}</td>
                        <td>{item.totalQuantitySold}</td>
                        <td style={{ fontWeight: "600", color: "#10b981" }}>₹{item.totalRevenue.toFixed(2)}</td>
                        <td>₹{item.averageUnitPrice.toFixed(2)}</td>
                        <td>₹{item.totalTax.toFixed(2)}</td>
                        <td>{item.timesInTransaction}</td>
                        <td style={{ fontSize: "12px", color: "#666" }}>{item.lastSoldDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#999" }}>
                        {searchQuery ? "No matching products found" : "No item sales data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredItems.length > 0 && (
              <p style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                Showing {filteredItems.length} of {itemAnalytics?.items?.length || 0} items
              </p>
            )}
          </div>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button className="btn-primary" onClick={loadReports}>
          Refresh Reports
        </button>
      </div>
    </PageLayout>
  );
}
