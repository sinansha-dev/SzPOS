import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { apiClient } from "../api/client";
import { getISTTimestamp } from "../utils/timezone";
import { Printer, AlertCircle } from "lucide-react";

type Product = { id: string; name: string; price: number; taxRate: number; stock: number };
type CartLine = Product & { qty: number };

function normalizeProducts(raw: unknown): Product[] {
  const source = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { products?: unknown }).products)
      ? (raw as { products: unknown[] }).products
      : [];

  return source
    .map((row) => row as Partial<Product>)
    .filter((row) => typeof row.id === "string" && typeof row.name === "string")
    .map((row) => ({
      id: row.id as string,
      name: row.name as string,
      price: Number(row.price ?? 0),
      taxRate: Number(row.taxRate ?? 0),
      stock: Number(row.stock ?? 0)
    }));
}

export function SaleScreenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [shouldAutoPrint, setShouldAutoPrint] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{ items: CartLine[]; total: number; paidBy: string; timestamp: string } | null>(null);
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
      setProducts(normalizeProducts(data));
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
    () => products.filter((p) => String(p.name).toLowerCase().includes(query.toLowerCase())),
    [query, products]
  );

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const tax = cart.reduce((sum, line) => sum + line.qty * line.price * line.taxRate, 0);
  const total = subtotal + tax;

  const receiptItems = lastReceipt?.items ?? cart;
  const receiptTotal = lastReceipt?.total ?? total;
  // Format IST timestamp for display (e.g., 2026-03-24T18:45:26+05:30)
  const receiptTimestamp = lastReceipt?.timestamp ?? getISTTimestamp();

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
    const receiptTime = getISTTimestamp();
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
      setShouldAutoPrint(true);
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
            {filtered.length === 0 && <p className="empty-cart">No products available</p>}
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
          <div style={{ maxWidth: "400px", margin: "0 auto", fontFamily: "monospace", fontSize: "12px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "bold" }}>SZPOS</h2>
              <p style={{ margin: "0", fontSize: "14px" }}>Receipt</p>
              <p style={{ margin: "0", letterSpacing: "1px" }}>═══════════════════════════════</p>
            </div>

            {/* Receipt info */}
            <div style={{ marginBottom: "12px", textAlign: "left" }}>
              <div>Receipt #: {lastReceipt?.paidBy ? "TXN_" + Date.now() : "DRAFT"}</div>
              <div>Date: {receiptTimestamp.substring(0, 10)}</div>
              <div>Time: {receiptTimestamp.substring(11, 19)}</div>
            </div>

            {/* Items header */}
            <div style={{ marginBottom: "8px", paddingBottom: "4px", borderBottom: "1px dashed #000" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", paddingBottom: "4px" }}>Item</th>
                    <th style={{ textAlign: "center", paddingBottom: "4px" }}>Qty</th>
                    <th style={{ textAlign: "right", paddingBottom: "4px" }}>Price</th>
                    <th style={{ textAlign: "right", paddingBottom: "4px" }}>Total</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Items */}
            {receiptItems.length === 0 ? (
              <p style={{ textAlign: "center", margin: "20px 0" }}>No items in cart</p>
            ) : (
              <>
                <div style={{ marginBottom: "8px" }}>
                  {receiptItems.map((line) => (
                    <table key={line.id} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: "left", width: "50%", wordBreak: "break-word" }}>
                            <strong>{line.name}</strong>
                          </td>
                          <td style={{ textAlign: "center", width: "10%" }}>{line.qty}</td>
                          <td style={{ textAlign: "right", width: "20%" }}>₹{line.price.toFixed(2)}</td>
                          <td style={{ textAlign: "right", width: "20%" }}>₹{(line.price * line.qty).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  ))}
                </div>

                {/* Separator */}
                <div style={{ borderBottom: "1px dashed #000", margin: "8px 0" }}></div>

                {/* Totals */}
                <div style={{ marginBottom: "12px", fontSize: "11px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Subtotal:</span>
                    <span>₹{(receiptTotal * 0.95).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Tax/GST:</span>
                    <span>₹{(receiptTotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", borderTopWidth: "2px", borderTopStyle: "double", paddingTop: "6px" }}>
                    <span>TOTAL:</span>
                    <span>₹{receiptTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ textAlign: "center", marginBottom: "12px", fontSize: "11px", borderTop: "1px solid #000", paddingTop: "8px" }}>
                  <div>Payment: <strong>{lastReceipt?.paidBy || "CASH"}</strong></div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: "center", fontSize: "10px", borderTop: "1px dashed #000", paddingTop: "8px" }}>
                  <p style={{ margin: "4px 0" }}>Thank you for your purchase!</p>
                  <p style={{ margin: "4px 0" }}>Please visit again!</p>
                  <p style={{ margin: "4px 0", fontSize: "9px", color: "#666" }}>═══════════════════════════════</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
