import { db } from "../firebase";
import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const buildCartItemId = (userId, productId, selectedOptionValue = 1) =>
  `${userId}_${productId}_${selectedOptionValue}`;

export const addToCart = async (userId, product) => {
  try {
    const selectedOptionValue = Number(product.selectedOptionValue) || 1;
    const cartItemRef = doc(
      db,
      "cart",
      buildCartItemId(userId, product.id, selectedOptionValue)
    );

    await setDoc(
      cartItemRef,
      {
        userId,
        product,
        quantity: increment(1),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { ok: true };
  } catch (err) {
    console.error("Failed to add to cart", err);
    return { ok: false, reason: err.message };
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    await deleteDoc(doc(db, "cart", cartItemId));
    return { ok: true };
  } catch (err) {
    console.error("Failed to remove from cart", err);
    return { ok: false, reason: err.message };
  }
};

export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    await updateDoc(doc(db, "cart", cartItemId), {
      quantity: safeQuantity,
    });

    return { ok: true };
  } catch (err) {
    console.error("Failed to update cart quantity", err);
    return { ok: false, reason: err.message };
  }
};
