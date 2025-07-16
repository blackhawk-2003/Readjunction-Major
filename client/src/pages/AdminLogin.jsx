import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [progress, setProgress] = useState(100);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show error from navigation state (e.g., redirect from dashboard)
  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
      setShowError(true);
      setProgress(100);
    }
  }, [location.state]);

  // Auto-dismiss error after 2 seconds with progress bar
  useEffect(() => {
    if (showError) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setShowError(false);
            setError("");
            return 0;
          }
          return prev - 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowError(false);
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error("Invalid email or password");
      }
      const data = await response.json();
      localStorage.setItem("adminToken", data.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setShowError(true);
      setProgress(100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {showError && (
        <div className="admin-login-error-side">
          <span>{error}</span>
          <div
            className="admin-login-error-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <div className="admin-login-field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="admin-login-field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="admin-login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
