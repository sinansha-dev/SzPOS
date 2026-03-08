import { useMemo, useState } from "react";
import { enqueue } from "../data/localQueue";
import { syncNow } from "../sync/syncEngine";

type Product = { id: string; name: string; price: number; taxRate: number };
type CartLine = Product & { qty: number };

const quickProducts: Product[] = [
  { id: "p_001", name: "Chocolate Cake", price: 120, taxRate: 0.05 },
  { id: "p_002", name: "Donut", price: 40, taxRate: 0.05 },
  { id: "p_003", name: "Cookie", price: 30, taxRate: 0.05 },
  { id: "p_004", name: "Brownie", price: 60, taxRate: 0.05 }
];

export function SaleScreen() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState("Ready");

  const filtered = useMemo(
    () => quickProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const tax = cart.reduce((sum, line) => sum + line.qty * line.price * line.taxRate, 0);
  const total = subtotal + tax;

  function addProduct(product: Product) {
    setCart((old) => {
      const found = old.find((line) => line.id === product.id);
      if (found) {
        return old.map((line) => (line.id === product.id ? { ...line, qty: line.qty + 1 } : line));
      }
      return [...old, { ...product, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((old) =>
      old
        .map((line) => (line.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line))
        .filter((line) => line.qty > 0)
    );
  }

  function completeSale(paymentMethod: "CASH" | "UPI" | "CARD") {
    const payload = {
      id: `sale_${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: cart,
      subtotal,
      taxTotal: tax,
      total,
      payment: { method: paymentMethod, amount: total },
      printStatus: "not_printed"
    };

    enqueue({
      id: payload.id,
      entity: "sale",
      operation: "create",
      payload,
      timestamp: payload.timestamp,
      deviceId: "tablet-01"
    });

    setCart([]);
    setStatus(`Sale queued offline (${paymentMethod})`);
  }

  async function runSync() {
    try {
      const result = await syncNow();
      setStatus(`Synced ${result.synced} changes`);
    } catch {
      setStatus("Sync failed (offline or server unavailable)");
    }
  }

  return (
    <div className="sale-screen">
      <header>
        <h1>SzPOS Sale Screen</h1>
        <div className="toolbar">
          <button onClick={runSync}>Sync</button>
          <button onClick={() => window.print()}>Print Receipt</button>
        </div>
      </header>

      <div className="layout">
        <section className="panel left">
          <input
            placeholder="Search barcode / name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="quick-grid">
            {filtered.map((product) => (
              <button key={product.id} className="quick-btn" onClick={() => addProduct(product)}>
                {product.name}
                <span>₹{product.price}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel middle">
          <h2>Cart</h2>
          {cart.map((line) => (
            <div className="line-item" key={line.id}>
              <div>
                <strong>{line.name}</strong>
                <small>₹{line.price}</small>
              </div>
              <div className="qty-controls">
                <button onClick={() => changeQty(line.id, -1)}>-</button>
                <span>{line.qty}</span>
                <button onClick={() => changeQty(line.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </section>

        <section className="panel right">
          <h2>Totals</h2>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST: ₹{tax.toFixed(2)}</p>
          <p className="total">Total: ₹{total.toFixed(2)}</p>

          <div className="pay-grid">
            <button onClick={() => completeSale("CASH")}>Cash</button>
            <button onClick={() => completeSale("UPI")}>UPI</button>
            <button onClick={() => completeSale("CARD")}>Card</button>
          </div>

          <button className="print" onClick={() => window.print()}>
            Print Receipt
          </button>
          <p className="status">{status}</p>
        </section>
      </div>
    </div>
  );
}
