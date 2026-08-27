"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InvoiceContent } from "@/components/InvoiceModal";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } =
    useCart();
  const { data: session } = useSession();
  const router = useRouter();

  // Checkout flows
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Save items at checkout time to show on the success/invoice screen
  const [checkedOutItems, setCheckedOutItems] = useState<any[]>([]);
  const [checkedOutTotal, setCheckedOutTotal] = useState(0);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  if (items.length === 0 && checkoutStep === "cart") {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <Link href="/">Browse Menu</Link>
        </div>
      </div>
    );
  }

  const deliveryFee = totalPrice >= 25 ? 0 : 3.99;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + tax;

  const handleProceedToCheckout = () => {
    if (!session) {
      router.push("/login?from=/cart");
      return;
    }
    setCheckedOutItems([...items]);
    setCheckedOutTotal(grandTotal);
    setCheckoutStep("checkout");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) return;

    setIsProcessing(true);
    try {
      const orderPayload = {
        user: session?.user?.name || "Customer",
        userEmail: session?.user?.email || "user@example.com",
        address: address,
        phone: phone,
        total: checkedOutTotal,
        items: checkedOutItems.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setPlacedOrderId(data.order.id);
        setIsProcessing(false);
        setCheckoutStep("success");
        clearCart();
      } else {
        alert(data.error || "Failed to place order. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Order error:", err);
      alert("Error placing order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="cart-page">
      {checkoutStep === "cart" && (
        <>
          <h1>Your Cart</h1>
          <p className="subtitle">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>

          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="ci-img">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={90}
                    height={90}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="ci-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span className="qty">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="row"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span></div>
            <div className="row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="row total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
            <button className="checkout-btn" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>

          <button
            onClick={clearCart}
            style={{
              marginTop: "1rem",
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "10px 24px",
              borderRadius: "50px",
              fontSize: "0.85rem",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Clear Cart
          </button>
        </>
      )}

      {checkoutStep === "checkout" && (
        <div className="checkout-form-container">
          <h2>Shipping & Payment Details</h2>
          <form onSubmit={handlePlaceOrder} className="auth-form" style={{ marginTop: "1.5rem" }}>
            <div className="input-group">
              <label htmlFor="address">Delivery Address</label>
              <input
                id="address"
                type="text"
                placeholder="123 Main St, Appt 4B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Contact Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  Credit / Debit Card
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="input-group" style={{ flex: 2 }}>
                  <label htmlFor="cardNum">Card Number</label>
                  <input id="cardNum" type="text" placeholder="1234 5678 9101 1121" required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label htmlFor="expiry">Expiry</label>
                  <input id="expiry" type="text" placeholder="MM/YY" required />
                </div>
              </div>
            )}

            <button type="submit" className="checkout-btn" style={{ marginTop: "2rem" }} disabled={isProcessing}>
              {isProcessing ? "Processing Order..." : `Place Order • $${checkedOutTotal.toFixed(2)}`}
            </button>
            
            <button
              type="button"
              onClick={() => setCheckoutStep("cart")}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                width: "100%",
                marginTop: "0.5rem",
                cursor: "pointer"
              }}
            >
              Back to Cart
            </button>
          </form>
        </div>
      )}

      {checkoutStep === "success" && (
        <div className="order-success-container">
          <div className="success-badge-icon">🎉</div>
          <h1>Order Placed Successfully!</h1>
          <p className="subtitle" style={{ marginBottom: "2.5rem" }}>
            Thank you for ordering with Foody Moody. Your food is being prepared!
          </p>

          {/* Professional Printable Invoice Component */}
          <div style={{ margin: "2rem 0", width: "100%" }}>
            <InvoiceContent
              invoice={{
                id: placedOrderId || "ORD-PENDING",
                user: session?.user?.name || "Customer",
                userEmail: session?.user?.email || "",
                date: new Date().toISOString().split("T")[0],
                status: "Processing",
                address: address,
                phone: phone,
                paymentMethod: paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Credit / Debit Card",
                total: checkedOutTotal,
                items: checkedOutItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  qty: item.quantity,
                  price: item.price,
                })),
              }}
            />
          </div>

          <div className="no-print" style={{ display: "flex", gap: "1rem", width: "100%" }}>
            <button className="checkout-btn" style={{ flex: 1 }} onClick={handlePrintInvoice}>
              🖨️ Print / Save PDF
            </button>
            <button
              className="checkout-btn"
              style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onClick={() => router.push("/")}
            >
              Browse Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
