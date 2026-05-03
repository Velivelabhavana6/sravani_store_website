import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { addToCart } from "../services/cartService";
import { auth } from "../firebase";
import useProducts from "../hooks/useProducts";
import {
  formatSelectionLabel,
  getProductDisplayPrice,
  getProductOriginalPrice,
  getProductDiscount,
} from "../services/productUtils";

const ProductDetails = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const product = useMemo(
    () => products.find((item) => String(item.id) === String(id)),
    [id, products]
  );

  const defaultOptionValue = product?.selectionOptions?.[0]?.value ?? 1;
  const [selectedOptionValue, setSelectedOptionValue] = useState(defaultOptionValue);
  const [customValue, setCustomValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  React.useEffect(() => {
    if (product?.selectionOptions?.[0]?.value) {
      setSelectedOptionValue(product.selectionOptions[0].value);
    }
  }, [product]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "60px" }}>Loading product...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: "60px", color: "crimson" }}>{error}</p>;
  if (!product) return <h2>Product not found</h2>;

  const displayPrice = getProductDisplayPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscount(product);
  const hasDiscount = discount > 0 && displayPrice < originalPrice;
  const total = selectedOptionValue * displayPrice;
  const selectionHeading = product.unitType === "piece" ? "Select Quantity" : "Select Weight";
  const customLabel = product.unitType === "piece" ? "Need a custom quantity?" : "Need a custom weight?";
  const customHint =
    product.unitType === "piece"
      ? "Enter the exact number of pieces you want."
      : "Enter any weight from 10 gm onwards.";

  const applyCustomValue = () => {
    const parsedValue = Number(customValue);
    const minimumValue = product.unitType === "piece" ? 1 : 10;

    if (!Number.isFinite(parsedValue) || parsedValue < minimumValue) {
      alert(product.unitType === "piece" ? "Please enter at least 1 piece." : "Please enter at least 10 gm.");
      return;
    }

    setSelectedOptionValue(parsedValue);
  };

  const handleAddToCart = () => {
    const user = auth.currentUser;
    if (!user || adding || product.inStock === false) {
      if (!user) {
        alert("Please login first to add items to cart");
      }
      return;
    }

    setAdding(true);
    setRecentlyAdded(true);

    const selectedOptionLabel =
      product.selectionOptions?.find((option) => option.value === selectedOptionValue)?.label ||
      formatSelectionLabel(product.unitType, selectedOptionValue);

    const addRequest = addToCart(user.uid, {
      ...product,
      selectedOptionValue,
      selectedOptionLabel,
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
    <div className="product-container">
      <div className="product-box product-box-details">
        {product.inStock === false && <div className="product-stock-overlay details-overlay">Out of Stock</div>}
        <img src={product.image} alt={product.name} loading="lazy" className="product-details-image" />

        <div className="product-details-panel">
          <h2>{product.name}</h2>

          {hasDiscount ? (
            <div className="product-price-block details-price-block">
              <div className="product-final-price">Rs. {displayPrice} / {product.unitLabel}</div>
              <div className="product-price-meta">
                <span className="product-original-price">Rs. {originalPrice}</span>
                <span className="product-discount-badge">{discount}% OFF</span>
              </div>
            </div>
          ) : (
            <p>Rs. {displayPrice}/{product.unitLabel}</p>
          )}

          <div className="product-selector-card">
            <div className="product-selector-title">{selectionHeading}</div>
            <div className="product-option-grid">
              {product.selectionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`product-option-chip${selectedOptionValue === option.value ? " active" : ""}`}
                  onClick={() => setSelectedOptionValue(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="product-custom-entry">
              <div className="product-custom-copy">
                <div className="product-custom-title">{customLabel}</div>
                <div className="product-custom-text">{customHint}</div>
              </div>
              <div className="product-custom-controls">
                <input
                  type="number"
                  min={product.unitType === "piece" ? 1 : 10}
                  step={product.unitType === "piece" ? 1 : 10}
                  className="product-custom-input"
                  placeholder={product.unitType === "piece" ? "Enter pieces" : "Enter weight in gm"}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                />
                <button type="button" className="product-custom-apply" onClick={applyCustomValue}>
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="product-total-block">
            <div className="product-total-label">
              {product.unitType === "piece" ? "Selected quantity" : "Selected weight"}
            </div>
            <h3 style={{ marginTop: "8px", marginBottom: 0 }}>
              {formatSelectionLabel(product.unitType, selectedOptionValue)}
            </h3>
            <h3 style={{ marginTop: "12px" }}>Total: Rs. {total}</h3>
          </div>

          <div style={{ marginTop: "18px" }}>
            <button
              className="btn-outline"
              type="button"
              onClick={handleAddToCart}
              disabled={adding || product.inStock === false}
            >
              {product.inStock === false
                ? "Out of Stock"
                : adding
                  ? "Adding..."
                  : recentlyAdded
                    ? "Added"
                    : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
