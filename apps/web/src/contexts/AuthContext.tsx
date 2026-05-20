import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: "OWNER" | "ADMIN" | "CASHIER" | "KITCHEN" | "VIEWER";
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = "szpos_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to restore auth state:", err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (username: string, password: string) => {
    if (!username || !password) throw new Error("Invalid credentials");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const payload = await res.json() as { user: User };
      setUser(payload.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload.user));
      return;
    } catch {
      // Hardcoded fallback for local testing
      if (username.toLowerCase() === "admin" && password === "1234") {
        const testUser: User = { id: "user_admin", username: "admin", role: "OWNER", name: "Admin" };
        setUser(testUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(testUser));
        return;
      }
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Don't render children until we've restored auth state
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
