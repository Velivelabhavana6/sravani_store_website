import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import logoSrc from "/images/logo.jpeg";
import { ADMIN_EMAIL } from "../services/productService";

const Header = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(auth.currentUser);
    const unsubAuth = onAuthStateChanged(auth, (current) => setUser(current));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return undefined;
    }

    const q = query(collection(db, "cart"), where("userId", "==", user.uid));
    const unsubCart = onSnapshot(q, (snap) => {
      const totalItems = snap.docs.reduce(
        (sum, cartDoc) => sum + (Number(cartDoc.data()?.quantity) || 1),
        0
      );
      setCartCount(totalItems);
    });
    return () => unsubCart();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <header className="header">
      <div />

      <div className="logo">
        <img src={logoSrc} alt="Sravani Store logo" className="logo-img" />
        <span className="logo-text">Sri renuka sogasulu</span>
      </div>

      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>
        <Link to="/cart" className="nav-link" title="Cart">Cart {cartCount}</Link>
        {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        {user ? (
          <span className="nav-link" style={{ cursor: "default" }}>
            {user.displayName || user.email}
          </span>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
        {user && (
          <button className="btn-small" style={{ marginLeft: "10px" }} onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
