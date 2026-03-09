import { useEffect, useMemo, useState } from "react";
import { enqueue } from "../data/localQueue";
import { syncNow } from "../sync/syncEngine";
import "../styles.css";

type Variant = { id: string; name: string; priceDelta: number };
type Product = {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  category: string;
  variants?: Variant[];
};

type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  variantName?: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
};

const productCatalog: Product[] = [
  {
    id: "p_001",
    name: "Chocolate Cake",
    category: "Bakery",
    price: 120,
    taxRate: 0.05,
    variants: [
      { id: "v_001", name: "Slice", priceDelta: 0 },
      { id: "v_002", name: "Half", priceDelta: 160 },
      { id: "v_003", name: "Full", priceDelta: 320 }
    ]
  },
  { id: "p_002", name: "Donut", category: "Bakery", price: 40, taxRate: 0.05 },
  { id: "p_003", name: "Cookie", category: "Snacks", price: 30, taxRate: 0.05 },
  { id: "p_004", name: "Brownie", category: "Dessert", price: 60, taxRate: 0.05 },
  { id: "p_005", name: "Masala Tea", category: "Beverage", price: 25, taxRate: 0.05 },
  { id: "p_006", name: "Cold Coffee", category: "Beverage", price: 90, taxRate: 0.05 }
];

const categories = ["All", "Bakery", "Dessert", "Snacks", "Beverage"] as const;

type PaymentMethod = "CASH" | "UPI" | "CARD";

export function SaleScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState("Ready");
  const [discount, setDiscount] = useState(0);
  const [online, setOnline] = useState<boolean>(window.navigator.onLine);
  const [variantTarget, setVariantTarget] = useState<Product | null>(null);

  useEffect(() => {
    function goOnline() {
      setOnline(true);
      setStatus("Back online. Ready to sync.");
    }

    function goOffline() {
      setOnline(false);
      setStatus("Offline mode active. Sales will queue locally.");
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "F1") {
        event.preventDefault();
        completeSale("CASH");
      }
      if (event.key === "F2") {
        event.preventDefault();
        completeSale("UPI");
      }
      if (event.key === "F3") {
        event.preventDefault();
        completeSale("CARD");
      }
      if (event.key === "Enter" && filtered.length > 0) {
        event.preventDefault();
        handleProductClick(filtered[0]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const filtered = useMemo(() => {
    return productCatalog.filter((product) => {
      const inCategory = activeCategory === "All" || product.category === activeCategory;
      const inQuery = product.name.toLowerCase().includes(query.toLowerCase());
      return inCategory && inQuery;
    });
  }, [activeCategory, query]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const taxTotal = cart.reduce((sum, line) => sum + line.qty * line.unitPrice * line.taxRate, 0);
  const total = Math.max(0, subtotal + taxTotal - discount);

  function addLine(product: Product, variant?: Variant) {
    const lineName = variant ? `${product.name} (${variant.name})` : product.name;
    const unitPrice = product.price + (variant?.priceDelta ?? 0);
    const lineKey = `${product.id}__${variant?.id ?? "base"}`;

    setCart((old) => {
      const existing = old.find((line) => line.lineId === lineKey);
      if (existing) {
        return old.map((line) => (line.lineId === lineKey ? { ...line, qty: line.qty + 1 } : line));
      }

      return [
        ...old,
        {
          lineId: lineKey,
          productId: product.id,
          name: lineName,
          variantName: variant?.name,
          qty: 1,
          unitPrice,
          taxRate: product.taxRate
        }
      ];
    });
  }

  function handleProductClick(product: Product) {
    if (product.variants?.length) {
      setVariantTarget(product);
      return;
    }

    addLine(product);
  }

  function changeQty(lineId: string, delta: number) {
    setCart((old) =>
      old
        .map((line) => (line.lineId === lineId ? { ...line, qty: Math.max(0, line.qty + delta) } : line))
        .filter((line) => line.qty > 0)
    );
  }

  function completeSale(paymentMethod: PaymentMethod) {
    if (!cart.length) {
      setStatus("Cart is empty.");
      return;
    }

    const payload = {
      id: `sale_${Date.now()}`,
      storeId: "store_01",
      userId: "cashier_01",
      timestamp: new Date().toISOString(),
      items: cart,
      subtotal,
      taxTotal,
      discountTotal: discount,
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
    setDiscount(0);
    setStatus(`Sale queued (${paymentMethod}). Press Sync when online.`);
  }

  async function runSync() {
    try {
      const result = await syncNow();
      setStatus(`Synced ${result.synced} queued changes.`);
    } catch {
      setStatus("Sync failed. Will retry once internet/server is available.");
    }
  }

  return (
    <div
      className="sale-screen"
      style={{
        background:
          "linear-gradient(160deg, rgba(238,242,255,0.75), rgba(246,251,255,0.8) 45%, rgba(238,252,246,0.75))"
      }}
    >
      <header className="topbar">
        <div>
          <h1>SzPOS • Smart Checkout</h1>
          <p className="hint">Enter = quick add • F1 Cash • F2 UPI • F3 Card</p>
        </div>
        <div className="toolbar">
          <span className={`badge ${online ? "online" : "offline"}`}>{online ? "Online" : "Offline"}</span>
          <button className="secondary" onClick={runSync}>
            Sync
          </button>
          <button className="primary" onClick={() => window.print()}>
            Print Receipt
          </button>
        </div>
      </header>

      <div className="layout">
        <section className="panel left">
          <input
            className="search"
            placeholder="Search barcode / name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="chips">
            {categories.map((category) => (
              <button
                key={category}
                className={category === activeCategory ? "chip active" : "chip"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="quick-grid">
            {filtered.map((product) => (
              <button key={product.id} className="quick-btn" onClick={() => handleProductClick(product)}>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <b>₹{product.price}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="panel middle">
          <h2>Cart Lines</h2>
          {cart.length === 0 ? <p className="empty">No items yet. Tap a product button to add.</p> : null}

          {cart.map((line) => (
            <div className="line-item" key={line.lineId}>
              <div>
                <strong>{line.name}</strong>
                <small>₹{line.unitPrice.toFixed(2)} each</small>
              </div>
              <div className="qty-controls">
                <button onClick={() => changeQty(line.lineId, -1)}>-</button>
                <span>{line.qty}</span>
                <button onClick={() => changeQty(line.lineId, 1)}>+</button>
              </div>
            </div>
          ))}
        </section>

        <section className="panel right">
          <h2>Checkout</h2>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST: ₹{taxTotal.toFixed(2)}</p>
          <label className="discount">
            Discount (₹)
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
          <p className="total">Total: ₹{total.toFixed(2)}</p>

          <div className="pay-grid">
            <button className="cash" onClick={() => completeSale("CASH")}>
              Cash (F1)
            </button>
            <button className="upi" onClick={() => completeSale("UPI")}>
              UPI (F2)
            </button>
            <button className="card" onClick={() => completeSale("CARD")}>
              Card (F3)
            </button>
          </div>

          <button className="print" onClick={() => window.print()}>
            Print Receipt
          </button>
          <button className="kitchen">Print Kitchen Ticket</button>
          <p className="status">{status}</p>
        </section>
      </div>

      {variantTarget ? (
        <div className="modal-backdrop" onClick={() => setVariantTarget(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Choose Variant • {variantTarget.name}</h3>
            {variantTarget.variants?.map((variant) => (
              <button
                key={variant.id}
                className="variant-btn"
                onClick={() => {
                  addLine(variantTarget, variant);
                  setVariantTarget(null);
                }}
              >
                {variant.name} • ₹{(variantTarget.price + variant.priceDelta).toFixed(2)}
              </button>
            ))}
            <button className="secondary" onClick={() => setVariantTarget(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
