import { useState, useEffect } from "react";
import { PageLayout } from "./PageLayout";
import { Plus, Edit2, Trash2, Shield, User, AlertCircle } from "lucide-react";
import { apiClient } from "../api/client";

interface StaffMember {
  id: string;
  name: string;
  username: string;
  role: "OWNER" | "ADMIN" | "CASHIER" | "KITCHEN" | "VIEWER";
  status: "active" | "inactive";
}

const emptyForm: { name: string; username: string; password: string; role: StaffMember["role"]; status: StaffMember["status"] } = { name: "", username: "", password: "", role: "CASHIER", status: "active" };

export function UsersPage() {
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data || []);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username) return setError("Name and username are required");
    try {
      if (editingId) await apiClient.updateUser(editingId, form);
      else await apiClient.createUser(form);
      setForm(emptyForm); setEditingId(null); setShowForm(false); await loadUsers(); setError("");
    } catch (err) { setError(editingId ? "Failed to update user" : "Failed to create user"); console.error(err); }
  };

  const startEdit = (user: StaffMember) => {
    setEditingId(user.id);
    setForm({ name: user.name, username: user.username, password: "", role: user.role, status: user.status });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await apiClient.updateUser(userId, { status: "inactive" });
      await loadUsers();
    }
  };

  const getRoleIcon = (role: string) => role === "ADMIN" || role === "OWNER" ? <Shield size={16} /> : <User size={16} />;

  if (loading) return <PageLayout title="User Management"><div style={{ textAlign: "center", padding: "40px" }}>Loading...</div></PageLayout>;

  return (
    <PageLayout title="User Management">
      <div className="page-header"><h2>Users & Staff</h2><button className="btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm(emptyForm); } }}><Plus size={20} />{showForm ? "Cancel" : "Add User"}</button></div>
      {error && <div className="error-message"><AlertCircle size={18} />{error}</div>}
      {showForm && <div className="form-card" style={{ marginBottom: "24px" }}><h3>{editingId ? "Edit User" : "Create New User"}</h3><form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group"><label>Full Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="form-group"><label>Username</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "Leave blank to keep unchanged" : "Set initial password"} /></div>
        <div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember["role"] })}><option value="CASHIER">Cashier</option><option value="KITCHEN">Kitchen</option><option value="VIEWER">Viewer</option><option value="ADMIN">Admin</option><option value="OWNER">Owner</option></select></div>
        <div className="form-group"><label>&nbsp;</label><button type="submit" className="btn-primary">{editingId ? "Update User" : "Create User"}</button></div>
      </form></div>}
      <div className="users-table"><table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {users.filter((u) => u.status === "active").map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>@{user.username}</td><td><span className="role-badge">{getRoleIcon(user.role)}{user.role}</span></td><td><span className={`status-badge ${user.status}`}>{user.status}</span></td><td className="actions"><button className="btn-icon edit" onClick={() => startEdit(user)}><Edit2 size={18} /></button><button className="btn-icon delete" onClick={() => handleDeleteUser(user.id)}><Trash2 size={18} /></button></td></tr>)}
      </tbody></table></div>
    </PageLayout>
  );
}
