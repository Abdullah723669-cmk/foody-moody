"use client";

import Image from "next/image";
import React from "react";

export interface InvoiceItem {
  id?: number;
  name: string;
  qty?: number;
  quantity?: number;
  price: number;
}

export interface InvoiceData {
  id: number | string;
  user: string;
  userEmail?: string;
  date: string;
  status?: string;
  address?: string;
  phone?: string;
  paymentMethod?: string;
  total: number;
  items: InvoiceItem[];
}

export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Zero Dollars Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function helper(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "") + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
    if (n < 1000000) return helper(Math.floor(n / 1000)) + "Thousand " + helper(n % 1000);
    if (n < 1000000000) return helper(Math.floor(n / 1000000)) + "Million " + helper(n % 1000000);
    return helper(Math.floor(n / 1000000000)) + "Billion " + helper(n % 1000000000);
  }

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  let words = "";
  if (dollars > 0) {
    words += helper(dollars).trim() + (dollars === 1 ? " Dollar" : " Dollars");
  }

  if (cents > 0) {
    const centsWords = helper(cents).trim();
    if (dollars > 0) {
      words += " and " + centsWords + (cents === 1 ? " Cent" : " Cents");
    } else {
      words += centsWords + (cents === 1 ? " Cent" : " Cents");
    }
  }

  return (words.trim() || "Zero Dollars") + " Only";
}

interface InvoiceContentProps {
  invoice: InvoiceData;
  statusOverride?: string;
}

export function InvoiceContent({ invoice, statusOverride }: InvoiceContentProps) {
  const currentStatus = statusOverride ?? invoice.status ?? "Delivered";

  // Calculate items breakdown
  const items = invoice.items || [];
  
  // Calculate subtotal from items if available, or approximate from total
  const calculatedItemsTotal = items.reduce((sum, item) => {
    const qty = item.qty ?? item.quantity ?? 1;
    return sum + (Number(item.price) || 0) * qty;
  }, 0);

  const finalTotal = invoice.total > 0 ? invoice.total : calculatedItemsTotal;
  const isFreeDelivery = finalTotal >= 25;
  const deliveryFee = isFreeDelivery ? 0 : 3.99;
  
  // Tax 8%
  let subtotal = calculatedItemsTotal;
  let tax = calculatedItemsTotal * 0.08;
  
  if (calculatedItemsTotal === 0 && finalTotal > 0) {
    tax = (finalTotal - (isFreeDelivery ? 0 : 3.99)) * 0.08 / 1.08;
    subtotal = finalTotal - (isFreeDelivery ? 0 : 3.99) - tax;
  }

  // Parse user and email if formatted as "Name (email)"
  let displayName = invoice.user || "Valued Customer";
  let displayEmail = invoice.userEmail || "";
  
  if (displayName.includes("(") && displayName.includes(")")) {
    const match = displayName.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      displayName = match[1];
      if (!displayEmail) displayEmail = match[2];
    }
  }

  const customerPhone = invoice.phone || "+1 (555) 019-2834";
  const customerAddress = invoice.address || "123 Fast Food Blvd, Suite 4B";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { bg: "rgba(0, 184, 148, 0.15)", border: "rgba(0, 184, 148, 0.4)", text: "#00b894" };
      case "shipped":
        return { bg: "rgba(52, 152, 219, 0.15)", border: "rgba(52, 152, 219, 0.4)", text: "#3498db" };
      case "processing":
        return { bg: "rgba(243, 156, 18, 0.15)", border: "rgba(243, 156, 18, 0.4)", text: "#f39c12" };
      default:
        return { bg: "rgba(231, 76, 60, 0.15)", border: "rgba(231, 76, 60, 0.4)", text: "#e74c3c" };
    }
  };

  const statusStyle = getStatusColor(currentStatus);

  return (
    <div className="printable-invoice professional-invoice" style={{
      background: "var(--bg-card)",
      color: "var(--text-primary)",
      borderRadius: "var(--radius)",
      padding: "2.5rem",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      lineHeight: "1.5",
      border: "1px solid var(--border)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
    }}>
      {/* ── TOP HEADER: Shop Brand & Invoice Info ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "2px solid var(--border)",
        paddingBottom: "1.8rem",
        marginBottom: "1.8rem",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        {/* Shop Logo & Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div style={{
            position: "relative",
            width: "65px",
            height: "65px",
            borderRadius: "14px",
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,230,109,0.15))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border)",
            flexShrink: 0
          }}>
            <Image
              src="/logo.png"
              alt="Foody Moody Logo"
              width={56}
              height={56}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{
                margin: 0,
                fontSize: "1.85rem",
                fontFamily: "'Playfair Display', serif",
                color: "var(--accent)",
                fontWeight: "700",
                letterSpacing: "-0.5px"
              }}>
                Foody Moody
              </h1>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: "500" }}>
              Premium Artisan Fast Food & Gourmet Dining at Your Doorstep 
            </p>
            <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              📍 Joorpukur par, Joydebpur, Gazipur
            </p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "50px",
            background: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            color: statusStyle.text,
            marginBottom: "0.5rem"
          }}>
            {currentStatus}
          </div>
          <h2 style={{
            margin: "0 0 4px",
            fontSize: "1.4rem",
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', serif"
          }}>
            INVOICE #{invoice.id}
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <strong>Date:</strong> {invoice.date || new Date().toISOString().split("T")[0]}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <strong>Payment:</strong> {invoice.paymentMethod || "Online (Card / COD)"}
          </p>
        </div>
      </div>

      {/* ── CUSTOMER & SHOP DETAILS SECTION ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Customer Information */}
        <div>
          <div style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--accent-2)",
            marginBottom: "0.6rem"
          }}>
            Customer / Deliver & Bill To
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
            👤 {displayName}
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <span style={{ fontSize: "1rem" }}>📞</span>
            <span><strong>Phone:</strong> {customerPhone}</span>
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <span style={{ fontSize: "1rem" }}>📍</span>
            <span><strong>Address:</strong> {customerAddress}</span>
          </div>
          {displayEmail && (
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <span style={{ fontSize: "1rem" }}>✉️</span>
              <span><strong>Email:</strong> {displayEmail}</span>
            </div>
          )}
        </div>

        {/* Shop Contact & Dispatch Details */}
        <div>
          <div style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--accent-2)",
            marginBottom: "0.6rem"
          }}>
            Store Information & Support
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
            🍔 Foody Moody Fast Food
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            📞 <strong>Direct:</strong> 01821406541 01840954822
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            ✉️ <strong>Support:</strong> contact@foodymoody.com
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            🌐 <strong>Website:</strong> www.foodymoody.com
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left"
        }}>
          <thead>
            <tr style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderBottom: "2px solid var(--border)"
            }}>
              <th style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", width: "45px" }}>#</th>
              <th style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>Item Description</th>
              <th style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "center", width: "80px" }}>Qty</th>
              <th style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "right", width: "110px" }}>Unit Price</th>
              <th style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "right", width: "120px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = item.qty ?? item.quantity ?? 1;
              const price = Number(item.price) || 0;
              const lineTotal = qty * price;

              return (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px", fontSize: "0.9rem", color: "var(--text-muted)" }}>{idx + 1}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.9rem", textAlign: "center", color: "var(--text-primary)" }}>
                    <span style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.06)",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontWeight: "600"
                    }}>
                      {qty}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.9rem", textAlign: "right", color: "var(--text-secondary)" }}>
                    ${price.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.95rem", fontWeight: "700", textAlign: "right", color: "var(--text-primary)" }}>
                    ${lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── TOTALS & SUMMARY SECTION ── */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "2rem"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "1.25rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <span>Delivery Fee:</span>
            <span>{isFreeDelivery ? <strong style={{ color: "#00b894" }}>FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
            borderTop: "2px solid var(--border)"
          }}>
            <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>Grand Total:</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-3)" }}>
              ${finalTotal.toFixed(2)}
            </span>
          </div>

          {/* Grand Total In Words */}
          <div style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px dashed var(--border)",
            fontSize: "0.84rem",
            lineHeight: "1.5",
            textAlign: "right",
            color: "var(--text-secondary)"
          }}>
            <span style={{ fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>
              In Words:
            </span>
            <span style={{ fontStyle: "italic", color: "var(--accent-2)", fontWeight: "600", letterSpacing: "0.2px" }}>
              {numberToWords(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER & POLICIES ── */}
      <div style={{
        marginTop: "1.5rem",
        paddingTop: "1.2rem",
        borderTop: "1px dashed var(--border)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
        fontSize: "0.82rem",
        color: "var(--text-muted)",
        lineHeight: "1.6"
      }}>
        <div>
          <strong style={{ color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
            Return & Refund Policy:
          </strong>
          If you are not 100% satisfied with your meal quality or order delivery, please reach out to our customer support within 30 minutes of delivery for an immediate replacement or full refund.
        </div>
        <div style={{ textAlign: "right" }}>
          <strong style={{ color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
            Thank you for dining with Foody Moody Fast!
          </strong>
          For any questions regarding this invoice, email <u>support@foodymoody.com</u> or call us directly at <u>01821406541 01840954822</u>.
        </div>
      </div>
    </div>
  );
}

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
  statusOverride?: string;
}

export default function InvoiceModal({ invoice, onClose, statusOverride }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="invoice-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="invoice-modal printable-modal" style={{ maxWidth: "820px", padding: "1.5rem" }}>
        {/* Modal Controls Bar (Only Title and Close 'X' Button) */}
        <div className="no-print" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          paddingBottom: "0.8rem",
          borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🧾</span>
            <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>Invoice Preview #{invoice.id}</span>
          </div>
          <div>
            <button
              type="button"
              className="close-btn"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "6px 12px",
                color: "var(--text-primary)",
                fontSize: "1rem",
                cursor: "pointer"
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Core Invoice Content */}
        <InvoiceContent invoice={invoice} statusOverride={statusOverride} />

        {/* Single Primary Action Button at Bottom */}
        <div className="no-print" style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem"
        }}>
          <button
            type="button"
            onClick={handlePrint}
            className="checkout-btn"
            style={{
              width: "auto",
              padding: "10px 24px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "10px 20px",
              borderRadius: "50px",
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
