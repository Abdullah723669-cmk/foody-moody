"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import type { Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const stock = (product as any).stock !== undefined ? (product as any).stock : 50;

  const handleAdd = () => {
    if (stock !== null && stock <= 0) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      <div className="img-wrap">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={260}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      <div className="card-body">
        <div className="card-category">{product.category}</div>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="rating">
            <span className="star">★</span> {product.rating} ({product.reviews})
          </span>
        </div>
        {stock !== null && (
          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: stock > 10 ? 'var(--text-muted)' : '#ef4444', fontWeight: stock <= 10 ? 'bold' : 'normal' }}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </div>
        )}
        <button
          className={`add-btn ${added ? "added" : ""}`}
          onClick={handleAdd}
          disabled={stock !== null && stock <= 0}
          style={{ opacity: stock !== null && stock <= 0 ? 0.5 : 1, cursor: stock !== null && stock <= 0 ? 'not-allowed' : 'pointer' }}
        >
          {stock !== null && stock <= 0 ? "Out of Stock" : (added ? "✓ Added to Cart" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}
