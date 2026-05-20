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
    // Simple mock authentication
    // In production, this would call your backend API
    if (username && password.length >= 4) {
      const mockUser: User = {
        id: `user_${Date.now()}`,
        username,
        role: username.toLowerCase() === "owner" ? "OWNER" : username.toLowerCase() === "admin" ? "ADMIN" : username.toLowerCase() === "viewer" ? "VIEWER" : username.toLowerCase() === "kitchen" ? "KITCHEN" : "CASHIER",
        name: username.charAt(0).toUpperCase() + username.slice(1)
      };
      setUser(mockUser);
      // Persist to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } else {
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
