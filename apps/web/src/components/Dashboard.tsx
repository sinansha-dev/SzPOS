import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogOut, ShoppingCart, BarChart3, Settings, Users, FileText, ReceiptText, Moon, Sun } from "lucide-react";
import { getAllowedNav } from "../auth/navigation";

const FEATURE_META: Record<string, { icon: JSX.Element; description: string; color: string }> = {
  "/sales": { icon: <ShoppingCart size={32} />, description: "Process sales and transactions", color: "#3b82f6" },
  "/sales-orders": { icon: <ReceiptText size={32} />, description: "Track queued and advance orders", color: "#06b6d4" },
  "/reports": { icon: <BarChart3 size={32} />, description: "View sales reports and analytics", color: "#10b981" },
  "/inventory": { icon: <FileText size={32} />, description: "Manage products and stock", color: "#8b5cf6" },
  "/expenses": { icon: <ReceiptText size={32} />, description: "Track operating expenses", color: "#f59e0b" },
  "/users": { icon: <Users size={32} />, description: "Manage staff and permissions", color: "#ef4444" },
  "/settings": { icon: <Settings size={32} />, description: "Configure system settings", color: "#6b7280" }
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };
  const features = getAllowedNav(user?.role);

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left"><h1 className="nav-logo">SzPOS</h1><span className="nav-tagline">Dashboard</span></div>
        <div className="nav-right">
          <button onClick={toggleTheme} className="theme-btn">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{theme === "dark" ? "Light" : "Dark"}</button>
          <div className="user-info"><span className="user-role">{user?.role}</span><span className="user-name">{user?.name}</span></div>
          <button onClick={handleLogout} className="logout-btn"><LogOut size={20} />Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header"><h2>Welcome, {user?.name}!</h2><p>Select a feature to get started</p></div>
        <div className="features-grid">
          {features.map((f) => {
            const meta = FEATURE_META[f.path] ?? { icon: <FileText size={32} />, description: "Open feature", color: "#3b82f6" };
            return (
              <div key={f.path} className="feature-card" onClick={() => navigate(f.path)} style={{ "--card-color": meta.color } as React.CSSProperties}>
                <div className="feature-icon">{meta.icon}</div>
                <h3>{f.title}</h3>
                <p>{meta.description}</p>
                <span className="feature-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
