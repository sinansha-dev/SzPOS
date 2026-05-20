import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogOut, Moon, Sun } from "lucide-react";
import { getAllowedNav } from "../auth/navigation";

export function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };
  const features = getAllowedNav(user?.role);

  return (
    <div className="dashboard">
      <nav className="dashboard-nav"><div className="nav-left"><h1 className="nav-logo">SzPOS</h1><span className="nav-tagline">Dashboard</span></div>
      <div className="nav-right"><button onClick={toggleTheme} className="theme-btn">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{theme === "dark" ? "Light" : "Dark"}</button>
      <div className="user-info"><span className="user-role">{user?.role}</span><span className="user-name">{user?.name}</span></div>
      <button onClick={handleLogout} className="logout-btn"><LogOut size={20} />Logout</button></div></nav>
      <div className="dashboard-content"><div className="dashboard-header"><h2>Welcome, {user?.name}!</h2></div>
      <div className="features-grid">{features.map((f) => <div key={f.path} className="feature-card" onClick={() => navigate(f.path)}><h3>{f.title}</h3></div>)}</div></div>
    </div>
  );
}
