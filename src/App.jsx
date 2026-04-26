import React from "react";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <div className="app-wrapper">
        <div className="container">
          <AppRoutes />
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </BrowserRouter>
  );
}

export default App;
