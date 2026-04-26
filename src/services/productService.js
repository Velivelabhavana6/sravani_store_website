import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { products as defaultProducts } from "../data/products";
import {
  calculateFinalPrice,
  getSelectionOptions,
  normalizeProduct,
} from "./productUtils";

export const ADMIN_EMAIL = "sravaniclient2802@gmail.com";
export const PRODUCT_CACHE_KEY = "products-cache-v2";

const PRODUCTS_COLLECTION = "products";
let seedProductsPromise = null;

const getProductsCollection = () => collection(db, PRODUCTS_COLLECTION);

const canUseBrowserStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const broadcastProductCache = (products) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("products-cache-updated", {
      detail: {
        cacheKey: PRODUCT_CACHE_KEY,
        products,
      },
    })
  );
};

export const readProductCache = (cacheKey = PRODUCT_CACHE_KEY) => {
  if (!canUseBrowserStorage() || !cacheKey) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(cacheKey);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map((product) => normalizeProduct(product));
  } catch {
    return [];
  }
};

const writeProductCache = (products, cacheKey = PRODUCT_CACHE_KEY) => {
  if (!canUseBrowserStorage() || !cacheKey) {
    return;
  }

  window.localStorage.setItem(cacheKey, JSON.stringify(products));
  broadcastProductCache(products);
};

const mutateProductCache = (updater, cacheKey = PRODUCT_CACHE_KEY) => {
  const previousProducts = readProductCache(cacheKey);
  const nextProducts = updater(previousProducts);
  writeProductCache(nextProducts, cacheKey);
  return previousProducts;
};

const sanitizeProductPayload = (productInput) => {
  const unitType = productInput.unitType || "gm";
  const unitLabel = productInput.unitLabel || (unitType === "piece" ? "piece" : "gm");
  const pricePerGram = Number(productInput.pricePerGram ?? productInput.price) || 0;
  const discount = Number(productInput.discount) || 0;

  return {
    name: productInput.name?.trim() || "",
    category: productInput.category?.trim().toLowerCase() || "gold",
    image: productInput.image || "",
    pricePerGram,
    discount,
    finalPrice: calculateFinalPrice(pricePerGram, discount),
    inStock: productInput.inStock !== false,
    unitType,
    unitLabel,
    selectionOptions: productInput.selectionOptions || getSelectionOptions(unitType),
  };
};

const optimizeImageFile = async (file) => {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = reject;
      nextImage.src = imageUrl;
    });

    const maxDimension = 600;
    const widthRatio = maxDimension / image.width;
    const heightRatio = maxDimension / image.height;
    const scale = Math.min(1, widthRatio, heightRatio);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const optimizedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not optimise image."));
          }
        },
        "image/jpeg",
        0.6
      );
    });

    return new File([optimizedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const fileToDataUrl = async (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

export const uploadProductImage = async (file) => {
  const optimizedFile = await optimizeImageFile(file);

  if (optimizedFile.size > 250 * 1024) {
    throw new Error("Image is still too large after compression. Please use a smaller image.");
  }

  return fileToDataUrl(optimizedFile);
};

export const addProduct = async (productInput) => {
  const payload = sanitizeProductPayload(productInput);
  const docRef = doc(getProductsCollection());
  const optimisticProduct = normalizeProduct({
    id: docRef.id,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const previousProducts = mutateProductCache((currentProducts) => [
    optimisticProduct,
    ...currentProducts.filter((product) => String(product.id) !== docRef.id),
  ]);

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return optimisticProduct;
  } catch (err) {
    writeProductCache(previousProducts);
    throw err;
  }
};

export const updateProduct = async (productId, updates) => {
  const payload = sanitizeProductPayload(updates);
  const previousProducts = mutateProductCache((currentProducts) =>
    currentProducts.map((product) =>
      String(product.id) === String(productId)
        ? normalizeProduct({
            ...product,
            ...payload,
            id: productId,
            updatedAt: new Date().toISOString(),
          })
        : product
    )
  );

  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    writeProductCache(previousProducts);
    throw err;
  }
};

export const deleteProduct = async (productId) => {
  const previousProducts = mutateProductCache((currentProducts) =>
    currentProducts.filter((product) => String(product.id) !== String(productId))
  );

  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (err) {
    writeProductCache(previousProducts);
    throw err;
  }
};

export const toggleProductStock = async (productId, inStock) => {
  const previousProducts = mutateProductCache((currentProducts) =>
    currentProducts.map((product) =>
      String(product.id) === String(productId)
        ? {
            ...product,
            inStock,
            updatedAt: new Date().toISOString(),
          }
        : product
    )
  );

  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      inStock,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    writeProductCache(previousProducts);
    throw err;
  }
};

export const ensureSeedProducts = async () => {
  if (!seedProductsPromise) {
    seedProductsPromise = (async () => {
      try {
        const snap = await getDocs(query(getProductsCollection(), limit(1)));
        if (!snap.empty) {
          return;
        }

        await Promise.all(
          defaultProducts.map((product) => {
            const payload = sanitizeProductPayload(product);
            return setDoc(doc(db, PRODUCTS_COLLECTION, String(product.id)), {
              ...payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          })
        );
      } catch (err) {
        console.warn("Seed products skipped. Using fallback products instead.", err);
      }
    })();
  }

  return seedProductsPromise;
};

export const subscribeToProducts = (onData, onError, options = {}) => {
  const { fallbackToLocalOnEmpty = true } = options;
  let hasTriggeredSeed = false;

  const productsQuery = query(getProductsCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(
    productsQuery,
    (snap) => {
      if (snap.empty && !hasTriggeredSeed) {
        hasTriggeredSeed = true;
        ensureSeedProducts();
      }

      const nextProducts =
        snap.empty && fallbackToLocalOnEmpty
          ? defaultProducts.map((product) => normalizeProduct(product))
          : snap.docs.map((productDoc) =>
              normalizeProduct({
                id: productDoc.id,
                ...productDoc.data(),
              })
            );

      if (nextProducts.length > 0) {
        writeProductCache(nextProducts);
      }

      onData(nextProducts);
    },
    onError
  );
};
