import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogOut, ShoppingCart, BarChart3, Settings, Users, FileText, Moon, Sun } from "lucide-react";

export function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const features = [
    { icon: <ShoppingCart size={32} />, title: "Point of Sale", description: "Process sales and transactions", path: "/sales", color: "#3b82f6" },
    { icon: <BarChart3 size={32} />, title: "Reports & Analytics", description: "View sales reports and analytics", path: "/reports", color: "#10b981" },
    { icon: <Users size={32} />, title: "Users", description: "Manage staff and permissions", path: "/users", color: "#f59e0b" },
    { icon: <FileText size={32} />, title: "Inventory", description: "Manage products and stock", path: "/inventory", color: "#8b5cf6" },
    { icon: <Settings size={32} />, title: "Settings", description: "Configure system settings", path: "/settings", color: "#6b7280" }
  ];

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h1 className="nav-logo">SzPOS</h1>
          <span className="nav-tagline">Dashboard</span>
        </div>
        <div className="nav-right">
          <button onClick={toggleTheme} className="theme-btn" title="Toggle dark mode">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <div className="user-info">
            <span className="user-role" style={{ background: user?.role === "admin" ? "#ef4444" : "#3b82f6" }}>{user?.role.toUpperCase()}</span>
            <span className="user-name">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome, {user?.name}!</h2>
          <p>Select a feature to get started</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.path} className="feature-card" onClick={() => navigate(feature.path)} style={{ "--card-color": feature.color } as React.CSSProperties}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="feature-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
