"use client";

import { useState, useEffect } from "react";
import { products as initialProducts, categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [productsList, setProductsList] = useState(initialProducts);

  useEffect(() => {
    const savedCustom = localStorage.getItem("foody_moody_custom_products");
    if (savedCustom) {
      const parsedCustom = JSON.parse(savedCustom);
      setProductsList([...initialProducts, ...parsedCustom]);
    }
  }, []);

  const filtered =
    activeCategory === "all"
      ? productsList
      : productsList.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <span className="hero-badge">🚀 Free delivery on orders over $25</span>
        <h1>
          Crave It. Order It.
          <br />
          <span className="gradient">Love Every Bite.</span>
        </h1>
        <p>
          Premium burgers, hand-tossed pizza, crispy chicken & more — crafted
          with passion and delivered blazing fast.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>50+</strong>
            <span>Menu Items</span>
          </div>
          <div className="hero-stat">
            <strong>15 min</strong>
            <span>Avg Delivery</span>
          </div>
          <div className="hero-stat">
            <strong>4.9★</strong>
            <span>Customer Rating</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="categories" id="categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <h2 className="section-title">
        {activeCategory === "all"
          ? "🔥 Our Full Menu"
          : `${categories.find((c) => c.id === activeCategory)?.icon} ${
              categories.find((c) => c.id === activeCategory)?.name
            }`}
      </h2>
      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
