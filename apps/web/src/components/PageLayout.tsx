import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowLeft, LogOut, Moon, Sun } from "lucide-react";
import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-layout">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <h1 className="nav-logo">{title}</h1>
        </div>
        <div className="nav-right">
          <button onClick={toggleTheme} className="theme-btn" title="Toggle dark mode">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="page-content">{children}</div>
    </div>
  );
}
