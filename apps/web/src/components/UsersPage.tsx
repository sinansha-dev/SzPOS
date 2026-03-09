import { useState, useEffect } from "react";
import { PageLayout } from "./PageLayout";
import { Plus, Edit2, Trash2, Shield, User, AlertCircle } from "lucide-react";
import { apiClient } from "../api/client";

interface StaffMember {
  id: string;
  name: string;
  username: string;
  role: "admin" | "cashier" | "manager";
  status: "active" | "inactive";
}

export function UsersPage() {
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", username: "", role: "cashier", status: "active" });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data || []);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username) {
      setError("Name and username are required");
      return;
    }

    try {
      await apiClient.createUser(newUser);
      setNewUser({ name: "", username: "", role: "cashier", status: "active" });
      setShowForm(false);
      await loadUsers();
      setError("");
    } catch (err) {
      setError("Failed to create user");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiClient.updateUser(userId, { status: "inactive" });
        await loadUsers();
        setError("");
      } catch (err) {
        setError("Failed to delete user");
        console.error(err);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield size={16} /> : <User size={16} />;
  };

  if (loading) {
    return (
      <PageLayout title="User Management">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="User Management">
      <div className="page-header">
        <h2>Users & Staff</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card" style={{ marginBottom: "24px" }}>
          <h3>Create New User</h3>
          <form onSubmit={handleAddUser} className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button type="submit" className="btn-primary">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter((u) => u.status === "active").map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>@{user.username}</td>
                <td>
                  <span className="role-badge">
                    {getRoleIcon(user.role)}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-icon edit">
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
