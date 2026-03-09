import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  role: "admin" | "cashier" | "manager";
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    // Simple mock authentication
    // In production, this would call your backend API
    if (username && password.length >= 4) {
      const mockUser: User = {
        id: `user_${Date.now()}`,
        username,
        role: username === "admin" ? "admin" : "cashier",
        name: username.charAt(0).toUpperCase() + username.slice(1)
      };
      setUser(mockUser);
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
  };

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
