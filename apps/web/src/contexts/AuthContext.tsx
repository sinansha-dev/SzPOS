import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { apiClient } from "../api/client";

type Role = "OWNER" | "ADMIN" | "CASHIER" | "KITCHEN" | "VIEWER";
interface User { id: string; accountId: string; role: Role; email: string; name: string; }
interface AuthContextType { user: User | null; isAuthenticated: boolean; login: (email: string, password: string)=>Promise<void>; signup: (p:{businessName:string;email:string;username:string;password:string;name:string})=>Promise<void>; logout: ()=>Promise<void>; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const KEY_U = "szpos_auth_user"; const KEY_T = "szpos_access_token";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [ready,setReady]=useState(false);
  useEffect(()=>{ const u=localStorage.getItem(KEY_U); if(u) setUser(JSON.parse(u)); setReady(true);},[]);
  const login = async (email:string,password:string)=>{ const d=await apiClient.login(email,password); localStorage.setItem(KEY_T,d.accessToken); localStorage.setItem(KEY_U,JSON.stringify(d.user)); setUser(d.user); };
  const signup = async (p:any)=>{ const d=await apiClient.signup(p); localStorage.setItem(KEY_T,d.accessToken); localStorage.setItem(KEY_U,JSON.stringify(d.user)); setUser(d.user); };
  const logout = async ()=>{ await apiClient.logout(); localStorage.removeItem(KEY_T); localStorage.removeItem(KEY_U); setUser(null); };
  if(!ready) return null;
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth(){ const c=useContext(AuthContext); if(!c) throw new Error("useAuth must be used within AuthProvider"); return c; }
