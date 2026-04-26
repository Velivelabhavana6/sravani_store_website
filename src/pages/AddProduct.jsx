import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { ADMIN_EMAIL, addProduct, uploadProductImage } from "../services/productService";
import { calculateFinalPrice, getSelectionOptions } from "../services/productUtils";

const AddProduct = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => auth.currentUser ?? undefined);
  const [form, setForm] = useState({
    name: "",
    category: "",
    pricePerGram: "",
    discount: "0",
    unitType: "gm",
    imageUrl: "",
    inStock: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
    return () => unsubscribe();
  }, []);

  const finalPrice = useMemo(
    () => calculateFinalPrice(form.pricePerGram, form.discount),
    [form.discount, form.pricePerGram]
  );

  if (user === undefined) {
    return <p style={{ textAlign: "center", marginTop: "80px" }}>Checking access...</p>;
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <h2 style={{ textAlign: "center", marginTop: "80px" }}>Access Denied</h2>;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("Preparing product...");

    try {
      let image = "";
      if (imageFile) {
        setStatus("Processing image...");
        image = await uploadProductImage(imageFile);
      } else {
        image = form.imageUrl.trim();
      }

      if (!image) {
        throw new Error("Please upload an image file or provide an image URL.");
      }

      setStatus("Saving product to your catalogue...");

      await addProduct({
        name: form.name,
        category: form.category,
        pricePerGram: Number(form.pricePerGram),
        discount: Number(form.discount),
        unitType: form.unitType,
        unitLabel: form.unitType === "piece" ? "piece" : "gm",
        image,
        inStock: form.inStock,
        selectionOptions: getSelectionOptions(form.unitType),
      });

      setStatus("Product added successfully.");
      navigate("/admin");
    } catch (err) {
      console.error("Failed to add product", err);
      setStatus(err.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-toolbar">
        <div>
          <h2>Add Product</h2>
          <p>Create a new product with pricing, discount, stock, and image upload details.</p>
        </div>
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Product Name</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label className="admin-field">
          <span>Category</span>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Ex: Gold, Silver, Pearls, Chains"
            required
          />
        </label>

        <label className="admin-field">
          <span>Unit Type</span>
          <select name="unitType" value={form.unitType} onChange={handleChange}>
            <option value="gm">Weight Based</option>
            <option value="piece">Piece Based</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Price</span>
          <input name="pricePerGram" type="number" min="0" step="0.01" value={form.pricePerGram} onChange={handleChange} required />
        </label>

        <label className="admin-field">
          <span>Discount (%)</span>
          <input name="discount" type="number" min="0" max="100" step="1" value={form.discount} onChange={handleChange} />
        </label>

        <label className="admin-field">
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
        </label>

        <label className="admin-field">
          <span>Image URL (Optional Backup)</span>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
        </label>

        <label className="admin-checkbox">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} />
          <span>Available in stock</span>
        </label>

        <div className="admin-preview-box">
          <div>Base Price: Rs. {form.pricePerGram || 0}</div>
          <div>Discount: {form.discount || 0}%</div>
          <div>Final Price: Rs. {finalPrice}</div>
        </div>

        <div className="admin-actions-row">
          <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
          <button className="btn-outline" type="button" onClick={() => navigate("/admin")}>Cancel</button>
        </div>

        {status && <p className="admin-status">{status}</p>}
      </form>
    </div>
  );
};

export default AddProduct;
