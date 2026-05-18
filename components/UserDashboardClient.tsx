"use client";

import { useEffect, useState } from "react";

export default function UserDashboardClient({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem("foody_moody_orders");
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // Filter orders placed by this specific user email
      const userOrders = allOrders.filter((o: any) => o.userEmail === user.email);
      setOrders(userOrders);
    } else {
      // Seed a default order for demo user if none exists
      const defaultOrders = [
        {
          id: 101,
          user: user.name || "Demo User",
          userEmail: user.email || "user@example.com",
          date: new Date().toISOString().split("T")[0],
          total: 45.99,
          status: "Pending",
          address: "123 Main St, Springfield",
          phone: "+1 (555) 019-2834",
          items: [
            { name: "Classic Smash Burger", qty: 2, price: 8.99 },
            { name: "Loaded Fries", qty: 1, price: 6.49 }
          ]
        }
      ];
      localStorage.setItem("foody_moody_orders", JSON.stringify(defaultOrders));
      setOrders(defaultOrders.filter((o: any) => o.userEmail === user.email));
    }
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
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.date}</td>
                      <td>
                        {o.items.map((item: any, idx: number) => (
                          <div key={idx} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {item.name} x {item.qty}
                          </div>
                        ))}
                      </td>
                      <td>${o.total.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${o.status.toLowerCase() === "delivered" ? "active" : "inactive"}`} style={{ textTransform: "capitalize" }}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="dashboard-card" style={{ height: "fit-content" }}>
          <h3>Saved Addresses</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            {orders.length > 0 ? orders[0].address : "123 Main St, Springfield"}
          </p>
        </div>
      </div>
    </div>
  );
}
