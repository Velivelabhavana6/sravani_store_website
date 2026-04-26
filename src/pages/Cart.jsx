import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { removeFromCart, updateCartQuantity } from "../services/cartService";
import { sendCartWhatsAppMessage } from "../services/whatsappService";
import { getProductDisplayPrice } from "../services/productUtils";

const pageStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "20px",
};

const layoutStyle = (hasItems) => ({
  display: "grid",
  gridTemplateColumns: hasItems ? "minmax(0, 2fr) minmax(280px, 1fr)" : "1fr",
  gap: "20px",
  alignItems: "start",
});

const cardStyle = {
  display: "grid",
  gridTemplateColumns: "80px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  border: "1px solid #eee",
  borderRadius: "14px",
  background: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const quantityButtonStyle = {
  minWidth: "36px",
  height: "36px",
  padding: 0,
  borderRadius: "50%",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
};

const Cart = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading cart...");

  useEffect(() => {
    let unsubCart = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubCart) {
        unsubCart();
        unsubCart = null;
      }
      if (!user) {
        setItems([]);
        setStatus("Please login to view your cart");
        return;
      }

      setStatus("Loading cart...");
      const q = query(
        collection(db, "cart"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      unsubCart = onSnapshot(
        q,
        (snap) => {
          const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setItems(data);
          setStatus(data.length === 0 ? "Your cart is empty" : "");
        },
        (err) => {
          console.error("Failed to load cart", err);
          setStatus("Could not load cart. Please try again.");
        }
      );
    });

    return () => {
      if (unsubCart) unsubCart();
      unsubAuth();
    };
  }, []);

  const handleRemove = async (id) => {
    const res = await removeFromCart(id);
    if (!res.ok) {
      alert(res.reason || "Could not remove item");
    }
  };

  const handleQuantityChange = async (id, nextQuantity) => {
    const res = await updateCartQuantity(id, nextQuantity);
    if (!res.ok) {
      alert(res.reason || "Could not update quantity");
    }
  };

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = getProductDisplayPrice(item.product || {});
    const unitLabel = item.product?.unitLabel || "gm";
    const selectedOptionValue = Number(item.product?.selectedOptionValue) || 10;
    const selectedOptionLabel =
      item.product?.selectedOptionLabel ||
      (unitLabel === "piece"
        ? `${selectedOptionValue} ${selectedOptionValue === 1 ? "piece" : "pieces"}`
        : selectedOptionValue >= 1000
          ? `${selectedOptionValue / 1000} kg`
          : `${selectedOptionValue} gm`);
    const lineTotal = quantity * unitPrice * selectedOptionValue;

    return {
      ...item,
      quantity,
      unitPrice,
      unitLabel,
      selectedOptionValue,
      selectedOptionLabel,
      lineTotal,
    };
  });

  const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const handlePlaceOrder = () => {
    if (normalizedItems.length === 0) {
      return;
    }

    sendCartWhatsAppMessage(normalizedItems, totalItems, grandTotal);
  };

  return (
    <div style={pageStyle}>
      <h2>Your Cart</h2>

      {status && <p>{status}</p>}

      <div style={layoutStyle(normalizedItems.length > 0)}>
        <div style={{ display: "grid", gap: "16px" }}>
          {normalizedItems.map((item) => (
            <div key={item.id} style={cardStyle}>
              {item.product?.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                />
              ) : (
                <div style={{ width: "80px", height: "80px", background: "#f4f4f4", borderRadius: "8px" }} />
              )}

              <div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {item.product?.name || "Product"}
                </div>
                <div style={{ color: "#555", marginTop: "4px" }}>
                  Rs. {item.unitPrice} per {item.unitLabel}
                </div>
                <div style={{ color: "#6a5a77", marginTop: "4px", fontSize: "0.92rem" }}>
                  {item.unitLabel === "piece" ? "Selected quantity" : "Selected weight"}: {item.selectedOptionLabel}
                </div>
                <div style={{ color: "#111", marginTop: "8px", fontWeight: 600 }}>
                  Item total: Rs. {item.lineTotal}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "12px",
                    border: "1px solid #e5d5dc",
                    borderRadius: "999px",
                    padding: "6px 10px",
                  }}
                >
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    style={quantityButtonStyle}
                  >
                    -
                  </button>
                  <span style={{ minWidth: "60px", textAlign: "center", fontWeight: 600 }}>
                    Qty: {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    style={quantityButtonStyle}
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="btn-outline" onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        {normalizedItems.length > 0 && (
          <div
            style={{
              background: "white",
              border: "1px solid #eee",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              padding: "20px",
              position: "sticky",
              top: "100px",
            }}
          >
            <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "16px" }}>
              Price Details
            </div>

            <div style={{ display: "grid", gap: "12px", color: "#333" }}>
              <div style={summaryRowStyle}>
                <span>Items ({totalItems})</span>
                <span>Rs. {grandTotal}</span>
              </div>
              <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                <div
                  style={{
                    ...summaryRowStyle,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  <span>Total Amount</span>
                  <span>Rs. {grandTotal}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "14px",
                borderRadius: "12px",
                background: "#faf6ff",
                border: "1px solid #eadcf6",
                color: "#5a486d",
                fontSize: "0.92rem",
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: "#4a335f", marginBottom: "6px" }}>
                Shipping Charges by Weight
              </div>
              <div>Up to 500 g: Rs. 50</div>
              <div>500 g to 1 kg: Rs. 65</div>
              <div>1 kg to 1.5 kg: Rs. 85</div>
              <div style={{ marginTop: "6px", fontSize: "0.86rem", color: "#766582" }}>
                Final shipping charges will be applied based on the total parcel weight.
              </div>
            </div>

            <button className="btn" style={{ width: "100%", marginTop: "18px" }} type="button" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
