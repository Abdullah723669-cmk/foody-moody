"use client";

import { useEffect, useState } from "react";
import InvoiceModal from "@/components/InvoiceModal";

export default function UserDashboardClient({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    // Load orders from Supabase API
    const userEmail = user?.email || "";
    fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error("Error fetching user orders:", err));
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name || "User"}!</h1>
        <span className="role-badge user-role">Role: {user.role || "user"}</span>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <h3>Recent Orders</h3>
          {orders.length === 0 ? (
            <p>You have no recent orders.</p>
          ) : (
            <div className="table-responsive" style={{ border: "none", marginTop: "1rem" }}>
              <table className="admin-table" style={{ background: "transparent" }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.date}</td>
                      <td>
                        {o.items.map((item: any, idx: number) => (
                          <div key={idx} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {item.name} x {item.qty}
                          </div>
                        ))}
                      </td>
                      <td><strong style={{ color: "var(--accent-3)" }}>${o.total.toFixed(2)}</strong></td>
                      <td>
                        <span className={`status-badge ${o.status.toLowerCase() === "delivered" ? "active" : "inactive"}`} style={{ textTransform: "capitalize" }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn view"
                          onClick={() => setSelectedInvoice(o)}
                          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          🧾 View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="dashboard-card" style={{ height: "fit-content" }}>
          <h3>Saved Delivery Information</h3>
          <div style={{ marginTop: "0.8rem", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <p><strong>Address:</strong> {orders.length > 0 ? (orders[0].address || "123 Main St, Springfield") : "123 Main St, Springfield"}</p>
            <p><strong>Phone:</strong> {orders.length > 0 ? (orders[0].phone || "+1 (555) 019-2834") : "+1 (555) 019-2834"}</p>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
