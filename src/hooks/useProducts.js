import { useEffect, useState } from "react";
import { products as fallbackProducts } from "../data/products";
import {
  PRODUCT_CACHE_KEY,
  readProductCache,
  subscribeToProducts,
} from "../services/productService";
import { normalizeProduct } from "../services/productUtils";

const normalizedFallbackProducts = fallbackProducts.map((product) => normalizeProduct(product));
const getProductReadErrorMessage = (err) => {
  if (err?.code === "permission-denied") {
    return "Live catalogue access is blocked for this user. Update Firestore rules to allow public product reads.";
  }

  return "Could not load live products right now.";
};

const useProducts = (options = {}) => {
  const {
    startWithFallback = true,
    fallbackOnError = true,
    fallbackToLocalOnEmpty = true,
    cacheKey = PRODUCT_CACHE_KEY,
  } = options;
  const cachedProducts = readProductCache(cacheKey);
  const initialProducts =
    cachedProducts.length > 0 ? cachedProducts : startWithFallback ? normalizedFallbackProducts : [];

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe;

    const handleCacheUpdate = (event) => {
      if (event.detail?.cacheKey !== cacheKey || !Array.isArray(event.detail?.products)) {
        return;
      }

      setProducts(event.detail.products.map((product) => normalizeProduct(product)));
      setLoading(false);
      setError("");
    };

    const handleStorageUpdate = (event) => {
      if (event.key !== cacheKey || !event.newValue) {
        return;
      }

      try {
        const nextProducts = JSON.parse(event.newValue);
        if (!Array.isArray(nextProducts)) {
          return;
        }

        setProducts(nextProducts.map((product) => normalizeProduct(product)));
        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Failed to read synced product cache", err);
      }
    };

    const start = () => {
      try {
        unsubscribe = subscribeToProducts(
          (nextProducts) => {
            const resolvedProducts =
              nextProducts.length > 0 || !fallbackOnError
                ? nextProducts
                : normalizedFallbackProducts;

            setProducts(resolvedProducts);
            setLoading(false);
            setError("");
          },
          (err) => {
            console.error("Failed to subscribe to products", err);
            if (fallbackOnError) {
              setProducts(normalizedFallbackProducts);
              setError(getProductReadErrorMessage(err));
            } else {
              setProducts([]);
              setError(getProductReadErrorMessage(err));
            }
            setLoading(false);
          },
          { fallbackToLocalOnEmpty }
        );
      } catch (err) {
        console.error("Failed to start product subscription", err);
        if (fallbackOnError) {
          setProducts(normalizedFallbackProducts);
          setError(getProductReadErrorMessage(err));
        } else {
          setProducts([]);
          setError(getProductReadErrorMessage(err));
        }
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("products-cache-updated", handleCacheUpdate);
      window.addEventListener("storage", handleStorageUpdate);
    }

    start();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("products-cache-updated", handleCacheUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      }
    };
  }, [cacheKey, fallbackOnError, fallbackToLocalOnEmpty]);

  return { products, loading, error };
};

export default useProducts;
