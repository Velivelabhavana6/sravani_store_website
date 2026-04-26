import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [status, setStatus] = useState("");

  const handleGoogleLogin = async () => {
    setStatus("Signing you in...");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const nameOrEmail = result.user.displayName || result.user.email || "your account";
      setStatus(`Signed in as ${nameOrEmail}`);
    } catch (err) {
      setStatus(err.message || "Sign-in failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Login</h2>

      <button className="btn" onClick={handleGoogleLogin}>
        Sign in with Google
      </button>

      <br />
      <br />

      <button className="btn-outline" disabled>
        Login with Phone (Next Step)
      </button>

      {status && (
        <p style={{ marginTop: "16px", color: status.includes("Signed") ? "green" : "crimson" }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default Login;
