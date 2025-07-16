import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLogOut,
  FiShield,
  FiHome,
  FiPackage,
} from "react-icons/fi";
import { useAuth } from "./useAuth";
import logoImg from "../assets/logo-transparent.png";
import "./auth.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="auth-container">
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
            <h1 className="auth-title">Access Denied</h1>
            <p className="auth-subtitle">Please log in to view your profile</p>
          </div>
          <button className="auth-submit" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
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
          <h1 className="auth-title">Profile</h1>
          <p className="auth-subtitle">Your account information</p>
        </div>

        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <FiUser
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
                type="text"
                className="form-input"
                value={`${user.profile?.firstName || ""} ${
                  user.profile?.lastName || ""
                }`}
                readOnly
                style={{ paddingLeft: "48px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
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
                className="form-input"
                value={user.email}
                readOnly
                style={{ paddingLeft: "48px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ position: "relative" }}>
              <FiShield
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
                type="text"
                className="form-input"
                value={
                  user.role === "buyer"
                    ? "Book Buyer"
                    : user.role === "seller"
                    ? "Book Seller"
                    : "Administrator"
                }
                readOnly
                style={{ paddingLeft: "48px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <div style={{ position: "relative" }}>
              <FiShield
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
                type="text"
                className="form-input"
                value={user.isActive ? "Active" : "Inactive"}
                readOnly
                style={{
                  paddingLeft: "48px",
                  backgroundColor: user.isActive ? "#c6f6d5" : "#fed7d7",
                  color: user.isActive ? "#22543d" : "#742a2a",
                }}
              />
            </div>
          </div>

          {user.role === "seller" && (
            <div className="business-info active">
              <h4>Seller Information</h4>
              <p
                style={{
                  color: "var(--text-light)",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                Your seller account is being reviewed. You'll be notified once
                approved.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              className="auth-submit"
              onClick={() => navigate("/")}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              }}
            >
              <FiHome style={{ marginRight: "8px" }} />
              Go Home
            </button>

            {user.role === "seller" && (
              <button
                className="auth-submit"
                onClick={() => navigate("/seller/dashboard")}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                }}
              >
                <FiPackage style={{ marginRight: "8px" }} />
                Seller Dashboard
              </button>
            )}

            <button
              className="auth-submit"
              onClick={handleLogout}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
              }}
            >
              <FiLogOut style={{ marginRight: "8px" }} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
