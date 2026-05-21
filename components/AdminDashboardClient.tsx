"use client";

import { useState, useEffect } from "react";
import { products as initialProducts } from "@/lib/data";
import { UploadButton } from "@/utils/uploadthing";

export default function AdminDashboardClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock State
  const [products, setProducts] = useState(initialProducts);
  const [productStocks, setProductStocks] = useState<Record<number, number>>({});

  // Add Product Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("burgers");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdImage, setNewProdImage] = useState("");

  const [users, setUsers] = useState<any[]>([
    { id: 1, name: "Admin User", email: "admin@example.com", role: "admin", status: "Active" },
    { id: 2, name: "Demo User", email: "user@example.com", role: "user", status: "Active" },
    { id: 3, name: "John Doe", email: "john@example.com", role: "user", status: "Inactive" },
  ]);

  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    // 1. Initialize product stocks
    let stocks: Record<number, number> = {};
    const savedStocks = localStorage.getItem("foody_moody_product_stocks");
    if (savedStocks) {
      stocks = JSON.parse(savedStocks);
    }

    // Load deleted products list
    const deletedProductIds = new Set<number>();
    const savedDeleted = localStorage.getItem("foody_moody_deleted_products");
    if (savedDeleted) {
      JSON.parse(savedDeleted).forEach((id: number) => deletedProductIds.add(id));
    }

    // Filter out deleted products from initialProducts
    const filteredInitialProducts = initialProducts.filter(p => !deletedProductIds.has(p.id));

    filteredInitialProducts.forEach(p => {
      if (stocks[p.id] === undefined) stocks[p.id] = 50;
    });

    // 2. Load custom products
    const savedCustom = localStorage.getItem("foody_moody_custom_products");
    if (savedCustom) {
      const parsedCustom = JSON.parse(savedCustom);
      setProducts([...filteredInitialProducts, ...parsedCustom]);
      parsedCustom.forEach((p: any) => {
        if (stocks[p.id] === undefined) stocks[p.id] = p.stock || 50;
      });
    } else {
      setProducts(filteredInitialProducts);
    }
    setProductStocks(stocks);
    localStorage.setItem("foody_moody_product_stocks", JSON.stringify(stocks));

    // 3. Load orders
    const savedOrders = localStorage.getItem("foody_moody_orders");
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      setOrders(allOrders);
      
      const statuses: Record<number, string> = {};
      allOrders.forEach((o: any) => {
        statuses[o.id] = o.status;
      });
      setOrderStatuses(statuses);
    } else {
      const defaultOrders = [
        {
          id: 101,
          user: "Demo User",
          userEmail: "user@example.com",
          date: "2026-05-18",
          total: 45.99,
          status: "Pending",
          address: "123 Main St, Springfield",
          phone: "+1 (555) 019-2834",
          items: [
            { name: "Classic Smash Burger", qty: 2, price: 8.99 },
            { name: "Loaded Fries", qty: 1, price: 6.49 }
          ]
        },
        {
          id: 102,
          user: "John Doe",
          userEmail: "john@example.com",
          date: "2026-05-17",
          total: 12.99,
          status: "Delivered",
          address: "456 Oak St, Metropolis",
          phone: "+1 (555) 987-6543",
          items: [
            { name: "Margherita Pizza", qty: 1, price: 12.99 }
          ]
        }
      ];
      localStorage.setItem("foody_moody_orders", JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
      
      const statuses: Record<number, string> = {};
      defaultOrders.forEach((o) => {
        statuses[o.id] = o.status;
      });
      setOrderStatuses(statuses);
    }

    // 4. Fetch users from dynamic API
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  }, []);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStockChange = (id: number, val: number) => {
    setProductStocks(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = (id: number) => {
    localStorage.setItem("foody_moody_product_stocks", JSON.stringify(productStocks));
    window.dispatchEvent(new Event("storage"));
    showToast(`Stock updated successfully to ${productStocks[id]}!`);
  };

  const handleStatusChange = (id: number, status: string) => {
    setOrderStatuses(prev => ({ ...prev, [id]: status }));
  };

  const handleSaveStatus = (id: number) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status: orderStatuses[id] } : o);
    setOrders(updatedOrders);
    localStorage.setItem("foody_moody_orders", JSON.stringify(updatedOrders));
    showToast(`Order #${id} status updated to ${orderStatuses[id]}!`);
  };

  const handleUserRoleChange = (email: string, role: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, role } : u));
  };

  const handleUserStatusChange = (email: string, status: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, status } : u));
  };

  const handleSaveUser = async (email: string) => {
    const userToSave = users.find(u => u.email === email);
    if (!userToSave) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userToSave.email,
          role: userToSave.role,
          status: userToSave.status
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User ${userToSave.name} updated successfully!`);
      } else {
        showToast(data.error || "Failed to update user");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error updating user");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.filter(u => u.email !== email));
        showToast(`User deleted successfully!`);
      } else {
        showToast(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error deleting user");
    }
  };

  const handleDeleteProduct = (id: number, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    // Add to deleted products list
    const savedDeleted = localStorage.getItem("foody_moody_deleted_products");
    const deletedList = savedDeleted ? JSON.parse(savedDeleted) : [];
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem("foody_moody_deleted_products", JSON.stringify(deletedList));
    }
    
    // Remove from custom products in localStorage if it exists
    const savedCustom = localStorage.getItem("foody_moody_custom_products");
    if (savedCustom) {
      const customList = JSON.parse(savedCustom);
      const filteredCustom = customList.filter((p: any) => p.id !== id);
      localStorage.setItem("foody_moody_custom_products", JSON.stringify(filteredCustom));
    }

    // Update products state
    setProducts(prev => prev.filter(p => p.id !== id));

    // Remove from stocks
    setProductStocks(prev => {
      const newStocks = { ...prev };
      delete newStocks[id];
      localStorage.setItem("foody_moody_product_stocks", JSON.stringify(newStocks));
      return newStocks;
    });

    showToast(`Product "${productName}" deleted successfully!`);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newId = Math.floor(1000 + Math.random() * 9000);
    const newProduct = {
      id: newId,
      name: newProdName,
      slug: newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: `Delicious hot freshly made ${newProdName}. Custom chef special recipe!`,
      price: parseFloat(newProdPrice) || 0,
      category: newProdCategory,
      image: newProdImage || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
      rating: 4.8,
      reviews: 1,
      stock: parseInt(newProdStock) || 50
    };

    // Save to localStorage
    const savedCustom = localStorage.getItem("foody_moody_custom_products");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    customList.push(newProduct);
    localStorage.setItem("foody_moody_custom_products", JSON.stringify(customList));

    // Update state
    setProducts([...initialProducts, ...customList]);
    setProductStocks(prev => ({ ...prev, [newId]: newProduct.stock }));

    // Reset Form & Close Modal
    setNewProdName("");
    setNewProdCategory("burgers");
    setNewProdPrice("");
    setNewProdStock("50");
    setNewProdImage("");
    setIsAddModalOpen(false);

    showToast(`Product "${newProduct.name}" added successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSales = orders
    .filter(o => o.status.toLowerCase() === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="dashboard-container admin-dashboard">
      {toastMessage && (
        <div className="toast-notification no-print">
          {toastMessage}
        </div>
      )}
      <div className="dashboard-header no-print">
        <div>
          <h1>Admin Control Panel</h1>
          <span className="role-badge admin-role">Administrator</span>
        </div>
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products & Stock</button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders & Invoices</button>
        </div>
      </div>
      
      {activeTab === "overview" && (
        <div className="no-print">
          <div className="dashboard-grid">
            <div className="dashboard-card stat-card">
              <h3>Total Sales</h3>
              <p className="stat-value">${totalSales.toFixed(2)}</p>
              <span className="trend positive">From delivered orders</span>
            </div>
            <div className="dashboard-card stat-card">
              <h3>Active Orders</h3>
              <p className="stat-value">{orders.filter(o => o.status === 'Pending').length}</p>
              <span className="trend neutral">Pending fulfillment</span>
            </div>
            <div className="dashboard-card stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{users.length}</p>
              <span className="trend positive">+1 new today</span>
            </div>
          </div>
          <div className="dashboard-section">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              {orders.slice(0, 3).map((o: any) => (
                <li key={`o-${o.id}`}>Order #{o.id} {o.status.toLowerCase()} by {o.user}</li>
              ))}
              {users.slice(-2).reverse().map((u: any) => (
                <li key={`u-${u.id}`}>New user registered / updated: {u.email}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="dashboard-section no-print">
          <div className="section-header">
            <h2>Products & Stock Management</h2>
            <button className="auth-btn credentials-btn" onClick={() => setIsAddModalOpen(true)} style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>+ Add Product</button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock (Edit)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.image} alt={p.name} width="40" height="40" style={{ borderRadius: '5px', objectFit: 'cover' }} /></td>
                    <td>{p.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        value={productStocks[p.id] ?? 50} 
                        onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                        className="stock-input" 
                      />
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleSaveStock(p.id)}>Save Stock</button>
                      <button className="action-btn delete" onClick={() => handleDeleteProduct(p.id, p.name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="dashboard-section no-print">
          <h2>User Management</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUserRoleChange(u.email, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        value={u.status} 
                        onChange={(e) => handleUserStatusChange(u.email, e.target.value)}
                        className="role-select status-select"
                        style={{
                          background: u.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.status === 'Active' ? '#10b981' : '#ef4444',
                          border: '1px solid currentColor',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleSaveUser(u.email)}>Save</button>
                      <button className="action-btn delete" onClick={() => handleDeleteUser(u.email)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="dashboard-section no-print">
          <h2>Order & Invoice Management</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.user}</td>
                    <td>{o.date}</td>
                    <td>${o.total.toFixed(2)}</td>
                    <td>
                      <select 
                        value={orderStatuses[o.id] ?? o.status} 
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleSaveStatus(o.id)}>Save Status</button>
                      <button className="action-btn view" onClick={() => setSelectedInvoice(o)}>View Invoice</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal for Printing */}
      {selectedInvoice && (
        <div className="invoice-overlay">
          <div className="invoice-modal printable-invoice">
            <div className="invoice-header">
              <h2>INVOICE #{selectedInvoice.id}</h2>
              <button className="close-btn no-print" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>
            
            <div className="invoice-body">
              <div className="invoice-meta">
                <div>
                  <strong>From:</strong><br/>
                  Foody Moody Inc.<br/>
                  123 Fast Food Blvd.<br/>
                  contact@foodymoody.com
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>To:</strong><br/>
                  {selectedInvoice.user}<br/>
                  Date: {selectedInvoice.date}<br/>
                  Status: {orderStatuses[selectedInvoice.id] ?? selectedInvoice.status}
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-total">
                <p>Subtotal: ${(selectedInvoice.total - (selectedInvoice.total > 25 ? 0 : 3.99) - (selectedInvoice.total * 0.08)).toFixed(2)}</p>
                <p>Tax (8%): ${(selectedInvoice.total * 0.08).toFixed(2)}</p>
                <p>Delivery: ${selectedInvoice.total > 25 ? "0.00" : "3.99"}</p>
                <h3>Grand Total: ${selectedInvoice.total.toFixed(2)}</h3>
              </div>

              {/* Return & Refund Policy Footer */}
              <div className="invoice-return-policy" style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <strong>Return & Refund Policy:</strong><br/>
                If you are not 100% satisfied with your meal, please contact us within 30 minutes of delivery for a full refund or replacement. Food items cannot be returned after consumption.
              </div>
            </div>

            <div className="invoice-footer no-print">
              <button className="auth-btn credentials-btn" onClick={handlePrint}>Print / Save as PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="invoice-overlay">
          <div className="invoice-modal" style={{ maxWidth: '500px' }}>
            <div className="invoice-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAddProduct} className="auth-form" style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label htmlFor="newProdName">Product Name</label>
                <input
                  id="newProdName"
                  type="text"
                  placeholder="e.g. Garlic Truffle Fries"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="newProdCategory">Category</label>
                <select
                  id="newProdCategory"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="role-select"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="burgers">Burgers</option>
                  <option value="pizza">Pizza</option>
                  <option value="chicken">Chicken</option>
                  <option value="sides">Sides</option>
                  <option value="drinks">Drinks</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="newProdPrice">Price ($)</label>
                  <input
                    id="newProdPrice"
                    type="number"
                    step="0.01"
                    placeholder="8.99"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="newProdStock">Initial Stock</label>
                  <input
                    id="newProdStock"
                    type="number"
                    placeholder="50"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                    <UploadButton
                      endpoint="productImage"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          setNewProdImage(res[0].url);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`Upload failed: ${error.message}`);
                      }}
                    />
                  </div>
                  {newProdImage && (
                    <div style={{ width: '100px', height: '100px', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={newProdImage} alt="Preview" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="checkout-btn" style={{ marginTop: '2rem' }}>
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
