import { PageLayout } from "./PageLayout";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";

export function SalesOrdersPage() {
  return (
    <PageLayout title="Sales Orders">
      <div className="sales-orders-page">
        <div className="sales-orders-hero">
          <h2>Sales Orders</h2>
          <p>Create, track, and complete queued/advance orders.</p>
        </div>
        <div className="sales-orders-cards">
          <div className="sales-order-card"><ClipboardList size={20} /><h4>Total Orders</h4><p>Use API endpoint to load live counts.</p></div>
          <div className="sales-order-card"><Clock size={20} /><h4>Pending</h4><p>Track open orders for kitchen/cashier flow.</p></div>
          <div className="sales-order-card"><CheckCircle2 size={20} /><h4>Completed</h4><p>Monitor fulfilled sales orders.</p></div>
        </div>
      </div>
    </PageLayout>
  );
}
