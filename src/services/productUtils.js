export const DEFAULT_WEIGHT_OPTIONS = [
  { value: 10, label: "10 gm" },
  { value: 25, label: "25 gm" },
  { value: 50, label: "50 gm" },
  { value: 100, label: "100 gm" },
  { value: 250, label: "250 gm" },
  { value: 500, label: "500 gm" },
  { value: 750, label: "750 gm" },
  { value: 1000, label: "1 kg" },
  { value: 1500, label: "1.5 kg" },
  { value: 2000, label: "2 kg" },
];

export const DEFAULT_PIECE_OPTIONS = [
  { value: 1, label: "1 piece" },
  { value: 2, label: "2 pieces" },
  { value: 5, label: "5 pieces" },
  { value: 10, label: "10 pieces" },
  { value: 25, label: "25 pieces" },
  { value: 50, label: "50 pieces" },
  { value: 100, label: "100 pieces" },
];

export const calculateFinalPrice = (pricePerGram, discount = 0) => {
  const safePrice = Number(pricePerGram) || 0;
  const safeDiscount = Number(discount) || 0;
  const discountedValue = safePrice - (safePrice * safeDiscount) / 100;
  return Number(discountedValue.toFixed(2));
};

export const getSelectionOptions = (unitType) =>
  unitType === "piece" ? DEFAULT_PIECE_OPTIONS : DEFAULT_WEIGHT_OPTIONS;

export const formatSelectionLabel = (unitType, value) => {
  const safeValue = Number(value) || 0;

  if (unitType === "piece") {
    return `${safeValue} ${safeValue === 1 ? "piece" : "pieces"}`;
  }

  if (safeValue >= 1000) {
    const kgValue = safeValue / 1000;
    return `${Number.isInteger(kgValue) ? kgValue : kgValue.toFixed(1)} kg`;
  }

  return `${safeValue} gm`;
};

export const getProductDisplayPrice = (product) =>
  Number(product.finalPrice ?? product.pricePerGram ?? product.price) || 0;

export const getProductOriginalPrice = (product) =>
  Number(product.pricePerGram ?? product.price) || 0;

export const getProductDiscount = (product) => Number(product.discount) || 0;

export const normalizeProduct = (product) => {
  const unitType = product.unitType || "gm";
  const unitLabel = product.unitLabel || (unitType === "piece" ? "piece" : "gm");
  const pricePerGram = Number(product.pricePerGram ?? product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = Number(product.finalPrice) || calculateFinalPrice(pricePerGram, discount);
  const inStock = product.inStock !== false;
  const selectionOptions =
    Array.isArray(product.selectionOptions) && product.selectionOptions.length > 0
      ? product.selectionOptions
      : getSelectionOptions(unitType);

  return {
    ...product,
    pricePerGram,
    price: pricePerGram,
    discount,
    finalPrice,
    inStock,
    unitType,
    unitLabel,
    selectionOptions,
  };
};
