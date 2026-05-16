import { useMemo, useState } from "react";
import { enqueue } from "../data/localQueue";
import { syncNow } from "../sync/syncEngine";
import { getISTTimestamp } from "../utils/timezone";
import { apiClient } from "../api/client";

type Product = { id: string; name: string; price: number; taxRate: number };
type CartLine = Product & { qty: number };

const quickProducts: Product[] = [
  { id: "p_001", name: "Chocolate Cake", price: 120, taxRate: 0.05 },
  { id: "p_002", name: "Donut", price: 40, taxRate: 0.05 },
  { id: "p_003", name: "Cookie", price: 30, taxRate: 0.05 },
  { id: "p_004", name: "Brownie", price: 60, taxRate: 0.05 }
];

const RECEIPTS_KEY = "szpos.receipts";

export function SaleScreen() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState("Ready");
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = useMemo(
    () => quickProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const total = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const subtotal = cart.reduce((sum, line) => sum + (line.qty * line.price) / (1 + line.taxRate), 0);
  const tax = total - subtotal;

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

  function saveReceiptToLocalStorage(saleData: any) {
    try {
      const receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) ?? "[]");
      receipts.push({
        id: saleData.id,
        timestamp: saleData.timestamp,
        items: saleData.items,
        subtotal: saleData.subtotal,
        taxTotal: saleData.taxTotal,
        total: saleData.total,
        payment: saleData.payment
      });
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    } catch (err) {
      console.error("Failed to save receipt:", err);
    }
  }

  function printReceipt(saleData: any) {
    // Create a printable receipt format
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${saleData.id}</title>
        <style>
          body { font-family: monospace; width: 80mm; margin: 0; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; }
          .header p { margin: 5px 0; font-size: 12px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .items { font-size: 12px; margin: 10px 0; }
          .item-row { display: flex; justify-content: space-between; }
          .totals { font-size: 14px; font-weight: bold; }
          .total-row { display: flex; justify-content: space-between; }
          .footer { text-align: center; font-size: 11px; margin-top: 20px; }
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SzPOS</h1>
          <p>Receipt</p>
          <p>ID: ${saleData.id}</p>
          <p>${saleData.timestamp}</p>
        </div>
        <div class="divider"></div>
        <div class="items">
          ${saleData.items.map((item: any) => `
            <div class="item-row">
              <span>${item.name} x${item.qty}</span>
              <span>₹${(item.price * item.qty).toFixed(2)}</span>
            </div>
          `).join("")}
        </div>
        <div class="divider"></div>
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${saleData.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (GST):</span>
            <span>₹${saleData.taxTotal.toFixed(2)}</span>
          </div>
          <div class="total-row" style="font-size: 16px; margin-top: 10px;">
            <span>Total:</span>
            <span>₹${saleData.total.toFixed(2)}</span>
          </div>
          <div class="total-row" style="margin-top: 10px;">
            <span>Payment:</span>
            <span>${saleData.payment.method}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Visit us again.</p>
        </div>
        <script>
          // Auto-print and close after printing
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 100);
          });
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  }

  async function completeSale(paymentMethod: "CASH" | "UPI" | "CARD") {
    if (cart.length === 0) {
      setStatus("Cart is empty!");
      return;
    }

    setIsProcessing(true);
    const istTimestamp = getISTTimestamp();
    const salePayload = {
      id: `sale_${Date.now()}`,
      timestamp: istTimestamp,
      items: cart,
      subtotal,
      taxTotal: tax,
      total,
      payment: { method: paymentMethod, amount: total },
      printStatus: "not_printed"
    };

    try {
      // Try to save to backend immediately
      const response = await apiClient.createSale(salePayload);
      
      // Save receipt locally
      saveReceiptToLocalStorage(salePayload);
      
      // Print receipt immediately
      printReceipt(salePayload);
      
      // Clear cart and show success message
      setCart([]);
      setStatus(`✓ Sale completed! (${paymentMethod}) Receipt printed.`);
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus("Ready"), 3000);
    } catch (err) {
      // If online save fails, queue it and still print receipt
      console.error("Failed to save online:", err);
      
      enqueue({
        id: salePayload.id,
        entity: "sale",
        operation: "create",
        payload: salePayload,
        timestamp: salePayload.timestamp,
        deviceId: "tablet-01"
      });
      
      // Save receipt locally
      saveReceiptToLocalStorage(salePayload);
      
      // Print receipt immediately
      printReceipt(salePayload);
      
      // Clear cart and show queued message
      setCart([]);
      setStatus(`📋 Sale queued (offline) - ${paymentMethod}. Receipt printed.`);
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus("Ready"), 3000);
    } finally {
      setIsProcessing(false);
    }
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
          <button onClick={runSync} disabled={isProcessing}>Sync</button>
          <button onClick={() => window.print()} disabled={isProcessing}>Print Receipt</button>
        </div>
      </header>

      <div className="layout">
        <section className="panel left">
          <input
            placeholder="Search barcode / name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
          />
          <div className="quick-grid">
            {filtered.map((product) => (
              <button 
                key={product.id} 
                className="quick-btn" 
                onClick={() => addProduct(product)}
                disabled={isProcessing}
              >
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
                <button onClick={() => changeQty(line.id, -1)} disabled={isProcessing}>-</button>
                <span>{line.qty}</span>
                <button onClick={() => changeQty(line.id, 1)} disabled={isProcessing}>+</button>
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
            <button onClick={() => completeSale("CASH")} disabled={isProcessing || cart.length === 0}>
              {isProcessing ? "Processing..." : "Cash"}
            </button>
            <button onClick={() => completeSale("UPI")} disabled={isProcessing || cart.length === 0}>
              {isProcessing ? "Processing..." : "UPI"}
            </button>
            <button onClick={() => completeSale("CARD")} disabled={isProcessing || cart.length === 0}>
              {isProcessing ? "Processing..." : "Card"}
            </button>
          </div>

          <button className="print" onClick={() => window.print()} disabled={isProcessing}>
            Print Receipt
          </button>
          <p className="status">{status}</p>
        </section>
      </div>
    </div>
  );
}
