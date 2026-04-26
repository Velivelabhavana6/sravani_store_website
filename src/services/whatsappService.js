const phone = "9100758185";

const buildWhatsAppUrl = (message = "") => {
  const query = new URLSearchParams({
    phone,
    lang: "en",
  });

  if (message) {
    query.set("text", message);
  }

  return `https://api.whatsapp.com/send/?${query.toString()}`;
};

export const sendWhatsAppMessage = (name, grams, total) => {
  const msg = `Hello, I want to order:\nProduct: ${name}\nQuantity: ${grams} gm\nTotal Price: Rs. ${total}`;

  window.open(buildWhatsAppUrl(msg), "_blank");
};

export const sendCartWhatsAppMessage = (items, totalItems, grandTotal) => {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.product?.name || "Product"} - ${item.selectedOptionLabel || ""} - Qty: ${item.quantity} - Rs. ${item.lineTotal}`
  );

  const msg = `Hello, I want to place this order:\n\n${lines.join("\n")}\n\nTotal Items: ${totalItems}\nGrand Total: Rs. ${grandTotal}`;

  window.open(buildWhatsAppUrl(msg), "_blank");
};

export { buildWhatsAppUrl };
