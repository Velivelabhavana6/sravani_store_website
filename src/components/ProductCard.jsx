import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../services/cartService";
import { auth } from "../firebase";
import {
  getProductDiscount,
  getProductDisplayPrice,
  getProductOriginalPrice,
} from "../services/productUtils";

const ProductCard = ({ product, inCart }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  const displayPrice = getProductDisplayPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscount(product);
  const hasDiscount = discount > 0 && displayPrice < originalPrice;

  const defaultSelection = useMemo(() => {
    const firstOption = product.selectionOptions?.[0];
    return {
      selectedOptionValue: firstOption?.value ?? 1,
      selectedOptionLabel: firstOption?.label ?? `1 ${product.unitLabel}`,
    };
  }, [product]);

  const handleAdd = () => {
    const user = auth.currentUser;
    if (!user || adding || product.inStock === false) {
      if (!user) {
        alert("Please login first to add items to cart");
      }
      return;
    }

    setAdding(true);
    setRecentlyAdded(true);

    const addRequest = addToCart(user.uid, {
      ...product,
      ...defaultSelection,
    });

    setTimeout(() => {
      setAdding(false);
    }, 350);

    setTimeout(() => {
      setRecentlyAdded(false);
    }, 1800);

    addRequest
      .then((res) => {
        if (!res.ok) {
          setRecentlyAdded(false);
          alert(res.reason || "Could not add to cart");
        }
      })
      .catch((err) => {
        setRecentlyAdded(false);
        alert(err?.message || "Could not add to cart");
      })
      .finally(() => {
        setAdding(false);
      });
  };

  return (
    <div className={`card${product.inStock === false ? " product-card-out" : ""}`}>
      {product.inStock === false && <div className="product-stock-overlay">Out of Stock</div>}
      <img src={product.image} alt={product.name} loading="lazy" />

      <h3>{product.name}</h3>
      <div className="product-price-block">
        {hasDiscount ? (
          <>
            <div className="product-final-price">Rs. {displayPrice} / {product.unitLabel}</div>
            <div className="product-price-meta">
              <span className="product-original-price">Rs. {originalPrice}</span>
              <span className="product-discount-badge">{discount}% OFF</span>
            </div>
          </>
        ) : (
          <p>Rs. {displayPrice} / {product.unitLabel}</p>
        )}
      </div>

      <button className="btn" onClick={() => navigate(`/product/${product.id}`)}>
        View Details
      </button>
      <button
        className="btn-outline"
        type="button"
        onClick={handleAdd}
        disabled={adding || product.inStock === false}
        title="Add to cart"
      >
        {product.inStock === false
          ? "Out of Stock"
          : adding
            ? "Adding..."
            : recentlyAdded
              ? "Added"
              : inCart
                ? "Add More"
                : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
