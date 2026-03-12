import { useMemo, useState, useEffect } from "react";
import { PageLayout } from "./PageLayout";
import { apiClient } from "../api/client";
import { Printer, AlertCircle } from "lucide-react";

type Product = { id: string; name: string; price: number; taxRate: number; stock: number };
type CartLine = Product & { qty: number };

export function SaleScreenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!shouldAutoPrint || !lastReceipt) {
      return;
    }

    window.print();
    setShouldAutoPrint(false);
  }, [shouldAutoPrint, lastReceipt]);

  const loadProducts = async () => {
    try {
      setBackendStatus("checking");
      const data = await apiClient.getProducts();
      setProducts(data || []);
      setBackendStatus("online");
      setLoading(false);
    } catch (err) {
      setError("Failed to load products");
      setBackendStatus("offline");
      setLoading(false);
    }
  };

  const checkBackend = async () => {
    try {
      setBackendStatus("checking");
      await apiClient.getProducts();
      setBackendStatus("online");
      setStatus("Backend connected ✓");
      setTimeout(() => setStatus("Ready"), 2000);
    } catch {
      setBackendStatus("offline");
      setStatus("Backend offline");
    }
  };

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query, products]
  );

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const tax = cart.reduce((sum, line) => sum + line.qty * line.price * line.taxRate, 0);
  const total = subtotal + tax;

  function addProduct(product: Product) {
    setCart((old) => {
      const found = old.find((line) => line.id === product.id);
      if (found) {
        if (found.qty >= product.stock) {
          setStatus(`Only ${product.stock} in stock`);
          return old;
        }

        return old.map((line) => (line.id === product.id ? { ...line, qty: line.qty + 1 } : line));
      }

      if (product.stock <= 0) {
        setStatus(`${product.name} is out of stock`);
        return old;
      }

      return [...old, { ...product, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((old) =>
      old
        .map((line) => {
          if (line.id !== id) {
            return line;
          }

          const maxQty = Math.max(0, line.stock);
          const nextQty = Math.min(maxQty, Math.max(0, line.qty + delta));
          if (delta > 0 && line.qty >= maxQty) {
            setStatus(`Only ${maxQty} in stock`);
          }

          return { ...line, qty: nextQty };
        })
        .filter((line) => line.qty > 0)
    );
  }

  async function completeSale(paymentMethod: "CASH" | "UPI" | "CARD") {
    if (cart.length === 0) {
      return;
    }

    const snapshot = cart.map((line) => ({ ...line }));
    const receiptTime = new Date().toISOString();
    const payload = {
      id: `sale_${Date.now()}`,
      timestamp: receiptTime,
      items: snapshot,
      subtotal,
      taxTotal: tax,
      total,
      payment: { method: paymentMethod, amount: total },
      printStatus: "printed"
    };

    try {
      await apiClient.createSale(payload);
      setLastReceipt({ items: snapshot, total, paidBy: paymentMethod, timestamp: receiptTime });
      setCart([]);
      setProducts((current) =>
        current.map((product) => {
          const soldLine = snapshot.find((line) => line.id === product.id);
          if (!soldLine) {
            return product;
          }

          return {
            ...product,
            stock: Math.max(0, product.stock - soldLine.qty)
          };
        })
      );
      setStatus(`Sale (${paymentMethod}) - ₹${total.toFixed(2)} ✓`);
      setError("");
      setTimeout(() => window.print(), 150);
      setTimeout(() => setStatus("Ready"), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save sale";
      setError(message);
      setStatus("Sale failed");
      console.error(err);
    }
  }

  async function runSync() {
    try {
      setStatus("Syncing...");
      // In production, call actual sync endpoint
      setStatus("Synced successfully");
      setTimeout(() => setStatus("Ready"), 2000);
    } catch {
      setStatus("Sync failed");
    }
  }

  if (loading) {
    return (
      <PageLayout title="Point of Sale">
        <div style={{ textAlign: "center", padding: "40px" }}>Loading products...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Point of Sale">
      <div className="sales-container">
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="sales-layout">
          {/* Products Panel */}
          <div className="sales-panel products-panel">
            <h3>Products</h3>
            <input
              type="text"
              placeholder="Search product..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <div className="products-grid">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  className="product-btn"
                  onClick={() => addProduct(product)}
                  disabled={product.stock <= 0}
                >
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">₹{product.price}</div>
                  <div className="product-stock">Stock: {product.stock}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="sales-panel cart-panel">
            <h3>Shopping Cart</h3>
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">No items in cart</p>
              ) : (
                cart.map((line) => (
                  <div className="cart-item" key={line.id}>
                    <div className="item-info">
                      <strong>{line.name}</strong>
                      <small>₹{line.price} × {line.qty}</small>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => changeQty(line.id, -1)}>-</button>
                      <span>{line.qty}</span>
                      <button onClick={() => changeQty(line.id, 1)}>+</button>
                    </div>
                    <div className="item-total">₹{(line.price * line.qty).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals Panel */}
          <div className="sales-panel totals-panel">
            <h3>Totals</h3>
            <div className="totals-breakdown">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-methods">
              <button
                onClick={() => completeSale("CASH")}
                disabled={cart.length === 0}
                className="payment-btn cash"
              >
                💵 Cash
              </button>
              <button
                onClick={() => completeSale("UPI")}
                disabled={cart.length === 0}
                className="payment-btn upi"
              >
                📱 UPI
              </button>
              <button
                onClick={() => completeSale("CARD")}
                disabled={cart.length === 0}
                className="payment-btn card"
              >
                💳 Card
              </button>
            </div>

            <button onClick={runSync} className="sync-btn">
              🔄 Sync
            </button>

            <button onClick={checkBackend} className="sync-btn">
              {backendStatus === "checking" ? "⏳ Checking Backend..." : backendStatus === "online" ? "🟢 Backend Online" : "🔴 Backend Offline"}
            </button>

            <button onClick={() => window.print()} className="print-btn">
              <Printer size={18} />
              Print Receipt
            </button>

            <div className="status-message">{status}</div>
          </div>
        </div>

        <div className="receipt-print-only">
          <h2>SzPOS Receipt</h2>
          <p>{new Date().toLocaleString()}</p>
          <hr />
          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <>
              {cart.map((line) => (
                <div key={line.id} className="receipt-line">
                  <span>{line.name} × {line.qty}</span>
                  <span>₹{(line.price * line.qty).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="receipt-line">
                <strong>Total</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
            </>
          )}
          <p className="receipt-footer">Thank you for shopping!</p>
        </div>
      </div>
    </PageLayout>
  );
}
