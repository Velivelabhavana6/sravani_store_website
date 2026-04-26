import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: "#111",
      color: "white",
      padding: "15px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h3>🌸 Sravani Store</h3>

      {/* Hamburger */}
      <div onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        ☰
      </div>

      {/* Menu */}
      {open && (
        <div style={{
          position: "absolute",
          right: "20px",
          top: "60px",
          background: "white",
          color: "black",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
        }}>
          <p><Link to="/">Home</Link></p>
          <p><Link to="/products">Products</Link></p>
          <p><Link to="/contact">Contact</Link></p>
        </div>
      )}
    </div>
  );
};

export default Navbar;