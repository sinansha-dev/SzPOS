import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function SignupPage() {
  const [form, setForm] = useState({ businessName: "", name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { await signup(form); navigate('/dashboard'); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } };
  return <div className="login-container"><div className="login-card"><h1>Create Business Account</h1><form onSubmit={submit} className="login-form">{Object.keys(form).map((k)=><input key={k} placeholder={k} type={k==='password'?'password':'text'} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required />)}{error && <div className="error-message">{error}</div>}<button type="submit" className="login-btn">Sign up</button><p>Already have an account? <Link to="/">Login</Link></p></form></div></div>;
}
