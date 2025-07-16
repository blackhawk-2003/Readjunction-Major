import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "./useAuth";
import logoImg from "../assets/logo-transparent.png";
import "./auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [progress, setProgress] = useState(100);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show warning if redirected from protected route, but suppress if just logged out
  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");
    if (justLoggedOut) {
      sessionStorage.removeItem("justLoggedOut");
      setShowWarning(false);
      return;
    }
    if (location.state && location.state.from) {
      setShowWarning(true);
      setProgress(100);
    }
  }, [location.state]);

  // Auto-dismiss warning after 3 seconds with progress bar
  useEffect(() => {
    if (showWarning) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setShowWarning(false);
            return 0;
          }
          return prev - 3.33; // 3 seconds total
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showWarning]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");

        // Redirect based on user role or back to original location
        setTimeout(() => {
          if (location.state && location.state.from) {
            // Redirect back to the page they were trying to access
            navigate(location.state.from.pathname);
          } else if (result.data.user.role === "seller") {
            navigate("/seller/dashboard");
          } else if (result.data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            // Default for buyers
            navigate("/");
          }
        }, 1500);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setFormData({ email: "", password: "" });
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="auth-container">
      {showWarning && (
        <div className="auth-warning">
          <div className="auth-warning-content">
            <FiAlertTriangle className="auth-warning-icon" />
            <span>Login Required</span>
            <p>Please log in to access the requested page</p>
          </div>
          <div
            className="auth-warning-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={logoImg}
              alt="ReadJunction Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "inherit",
              }}
            />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your ReadJunction account</p>
        </div>

        {error && (
          <div className="message error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <FiAlertCircle />
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <FiMail
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  zIndex: 1,
                }}
              />
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${
                  error && !formData.email ? "error" : ""
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                style={{ paddingLeft: "48px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input">
              <FiLock
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  zIndex: 1,
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${
                  error && !formData.password ? "error" : ""
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                style={{ paddingLeft: "48px" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Don't have an account? <Link to="/register">Create one here</Link>
          </p>
          <p style={{ marginTop: "10px" }}>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
