import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <div className="landing-card">
        <div className="landing-text">
          <h1>
            Welcome to <br />
            <span>Sravani Store </span>
          </h1>

          <p>Elegant jewellery & craft materials curated with love</p>

          <div className="buttons">
            <button className="btn" onClick={() => navigate("/products")}>
              Explore
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </div>
        </div>

        <div className="landing-image">
          <img src="/assets/ring.jpg" alt="jewellery" />
        </div>
      </div>
    </div>
  );
};

export default Home;
