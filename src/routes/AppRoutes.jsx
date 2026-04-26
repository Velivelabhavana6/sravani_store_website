import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import AdminDashboard from "../pages/AdminDashboard";
import AddProduct from "../pages/AddProduct";
import { ADMIN_EMAIL } from "../services/productService";

const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(() => auth.currentUser ?? undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <p style={{ textAlign: "center", marginTop: "80px" }}>Checking access...</p>;
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/add-product"
        element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
