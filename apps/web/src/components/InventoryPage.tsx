import { useState, useEffect } from "react";
import { PageLayout } from "./PageLayout";
import { Plus, Edit2, Trash2, AlertCircle, X } from "lucide-react";
import { apiClient } from "../api/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    stock: "",
    price: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProducts();
      setProducts(data);
      setError("");
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const handleSave = async (productId: string) => {
    try {
      await apiClient.updateProduct(productId, editData);
      setEditingId(null);
      setEditData({});
      await loadProducts();
      setError("");
    } catch (err) {
      setError("Failed to update product");
      console.error(err);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.updateProduct(productId, { stock: 0 });
        await loadProducts();
        setError("");
      } catch (err) {
        setError("Failed to delete product");
        console.error(err);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.sku || !newProduct.stock || !newProduct.price) {
      setError("All fields are required");
      return;
    }

    try {
      await apiClient.createProduct({
        name: newProduct.name,
        sku: newProduct.sku,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price),
        taxRate: 0.05
      });
      
      setNewProduct({ name: "", sku: "", stock: "", price: "" });
      setShowAddForm(false);
      await loadProducts();
      setError("");
    } catch (err) {
      setError("Failed to create product");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Inventory Management">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Inventory Management">
      <div className="page-header">
        <h2>Products & Inventory</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} />
          {showAddForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3>Add New Product</h3>
            <button 
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: "#999" }}
              onClick={() => setShowAddForm(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleAddProduct} className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g., Chocolate Cake"
                required
              />
            </div>

            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="e.g., CAKE-002"
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                placeholder="e.g., 20"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="e.g., 150"
                required
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn-primary">
                <Plus size={20} />
                Create Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Price (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="inline-input"
                    />
                  ) : (
                    <strong>{product.name}</strong>
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editData.sku || ""}
                      onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                      className="inline-input"
                    />
                  ) : (
                    product.sku
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={editData.stock || ""}
                      onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })}
                      className="inline-input"
                    />
                  ) : (
                    <span className={`stock-badge ${product.stock < 20 ? "low" : ""}`}>
                      {product.stock}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={editData.price || ""}
                      onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                      className="inline-input"
                    />
                  ) : (
                    <strong>₹{product.price}</strong>
                  )}
                </td>
                <td className="actions">
                  {editingId === product.id ? (
                    <>
                      <button
                        className="btn-icon save"
                        onClick={() => handleSave(product.id)}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        className="btn-icon cancel"
                        onClick={() => setEditingId(null)}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
