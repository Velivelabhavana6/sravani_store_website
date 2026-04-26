import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { auth, db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import useProducts from "../hooks/useProducts";

const Products = () => {
  const [filter, setFilter] = useState("all");
  const [cartProductIds, setCartProductIds] = useState(new Set());
  const { products, error } = useProducts();
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category?.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    return ["all", ...uniqueCategories];
  }, [products]);

  const formatCategoryLabel = (category) =>
    category
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    let unsubAuth;
    let unsubCart;

    unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubCart) {
        unsubCart();
        unsubCart = null;
      }
      if (!user) {
        setCartProductIds(new Set());
        return;
      }
      const q = query(collection(db, "cart"), where("userId", "==", user.uid));
      unsubCart = onSnapshot(q, (snap) => {
        const next = new Set();
        snap.forEach((cartDoc) => {
          if (cartDoc.data()?.product?.id) {
            next.add(String(cartDoc.data().product.id));
          }
        });
        setCartProductIds(next);
      });
    });

    return () => {
      if (unsubCart) unsubCart();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const filteredProducts = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((product) => product.category?.trim().toLowerCase() === filter),
    [filter, products]
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Our Products
      </h2>

      <div className="shipping-scroll-wrap">
        <div className="shipping-scroll-track">
          <div className="shipping-chip">Shipping up to 500 g: Rs. 50</div>
          <div className="shipping-chip">Shipping from 500 g to 1 kg: Rs. 65</div>
          <div className="shipping-chip">Shipping from 1 kg to 1.5 kg: Rs. 85</div>
          <div className="shipping-chip">Shipping up to 500 g: Rs. 50</div>
          <div className="shipping-chip">Shipping from 500 g to 1 kg: Rs. 65</div>
          <div className="shipping-chip">Shipping from 1 kg to 1.5 kg: Rs. 85</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            className="btn"
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? "#ff3f6c" : "#eee",
              color: filter === cat ? "white" : "black",
              transform: filter === cat ? "scale(1.05)" : "scale(1)",
              transition: "0.3s",
            }}
          >
            {formatCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {error && <p style={{ textAlign: "center", color: "crimson" }}>{error}</p>}

      <div className="grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inCart={cartProductIds.has(String(product.id))}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>
            No products found
          </p>
        )}
      </div>
    </div>
  );
};

export default Products;
