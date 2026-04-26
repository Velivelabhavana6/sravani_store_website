import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import useProducts from "../hooks/useProducts";
import {
  ADMIN_EMAIL,
  PRODUCT_CACHE_KEY,
  deleteProduct,
  toggleProductStock,
  updateProduct,
} from "../services/productService";
import {
  calculateFinalPrice,
  getProductDisplayPrice,
  getProductDiscount,
  getProductOriginalPrice,
} from "../services/productUtils";

const AdminDashboard = () => {
  const { products, loading, error } = useProducts({
    startWithFallback: false,
    fallbackOnError: false,
    fallbackToLocalOnEmpty: false,
    cacheKey: PRODUCT_CACHE_KEY,
  });
  const [user, setUser] = useState(() => auth.currentUser ?? undefined);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({ pricePerGram: "", discount: "" });
  const [actionStatus, setActionStatus] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
    return () => unsubscribe();
  }, []);

  const finalPreview = useMemo(
    () => calculateFinalPrice(draft.pricePerGram, draft.discount),
    [draft.discount, draft.pricePerGram]
  );

  if (user === undefined) {
    return <p style={{ textAlign: "center", marginTop: "80px" }}>Checking access...</p>;
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <h2 style={{ textAlign: "center", marginTop: "80px" }}>Access Denied</h2>;
  }

  const startEditing = (product) => {
    setEditingId(product.id);
    setDraft({
      pricePerGram: String(product.pricePerGram ?? product.price ?? ""),
      discount: String(product.discount ?? 0),
    });
    setActionStatus("");
  };

  const stopEditing = () => {
    setEditingId("");
    setDraft({ pricePerGram: "", discount: "" });
  };

  const handleSave = async (product) => {
    setBusyId(product.id);
    setActionStatus("Updating product...");

    try {
      await updateProduct(product.id, {
        ...product,
        pricePerGram: Number(draft.pricePerGram),
        discount: Number(draft.discount),
      });
      setActionStatus("Product updated successfully.");
      stopEditing();
    } catch (err) {
      console.error("Failed to update product", err);
      setActionStatus(err.message || "Could not update product.");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) {
      return;
    }

    setBusyId(productId);
    setActionStatus("Deleting product...");

    try {
      await deleteProduct(productId);
      setActionStatus("Product deleted successfully.");
    } catch (err) {
      console.error("Failed to delete product", err);
      setActionStatus(err.message || "Could not delete product.");
    } finally {
      setBusyId("");
    }
  };

  const handleToggleStock = async (product) => {
    setBusyId(product.id);
    setActionStatus("Updating stock status...");

    try {
      await toggleProductStock(product.id, !product.inStock);
      setActionStatus("Stock status updated.");
    } catch (err) {
      console.error("Failed to update stock", err);
      setActionStatus(err.message || "Could not update stock status.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-toolbar">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage product pricing, discounts, availability, and catalogue updates in one place.</p>
        </div>
        <Link to="/admin/add-product" className="btn admin-link-btn">Add Product</Link>
      </div>

      {actionStatus && <p className="admin-status">{actionStatus}</p>}
      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div className="admin-grid">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const currentDiscount = getProductDiscount(product);
            const currentDisplayPrice = getProductDisplayPrice(product);
            const currentOriginalPrice = getProductOriginalPrice(product);

            return (
              <div key={product.id} className="admin-product-card">
                <img src={product.image} alt={product.name} className="admin-product-image" />
                <div className="admin-product-body">
                  <div className="admin-product-head">
                    <h3>{product.name}</h3>
                    <span className={`admin-stock-badge ${product.inStock ? "in" : "out"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="admin-edit-panel">
                      <label className="admin-field">
                        <span>Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.pricePerGram}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, pricePerGram: event.target.value }))
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Discount (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={draft.discount}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, discount: event.target.value }))
                          }
                        />
                      </label>
                      <div className="admin-preview-box">Final Price Preview: Rs. {finalPreview}</div>
                      <div className="admin-actions-row">
                        <button className="btn" type="button" disabled={busyId === product.id} onClick={() => handleSave(product)}>
                          Save
                        </button>
                        <button className="btn-outline" type="button" onClick={stopEditing}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-product-meta">
                      <div>Price: Rs. {currentOriginalPrice}</div>
                      <div>Discount: {currentDiscount}%</div>
                      <div>Final Price: Rs. {currentDisplayPrice}</div>
                      <div>Unit: {product.unitLabel}</div>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="admin-actions-row">
                      <button className="btn" type="button" onClick={() => startEditing(product)}>Edit</button>
                      <button className="btn-outline" type="button" onClick={() => handleDelete(product.id)} disabled={busyId === product.id}>
                        Delete
                      </button>
                      <button className="btn-outline" type="button" onClick={() => handleToggleStock(product)} disabled={busyId === product.id}>
                        {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
