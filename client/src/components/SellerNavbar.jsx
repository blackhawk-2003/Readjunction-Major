import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FiUser, FiLogOut } from "react-icons/fi";
import "../styles/AdminNavbar.css";
import logoImg from "../assets/logo-transparent.png";

const SellerNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className="admin-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.2rem 2.5rem",
        minHeight: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <div
          className="admin-navbar__logo"
          onClick={() => navigate("/seller/dashboard")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: ".7rem",
          }}
        >
          <img src={logoImg} alt="Logo" className="admin-navbar__logo-img" />
          <span className="admin-navbar__logo-text">Seller Portal</span>
        </div>
        <div
          className="admin-navbar__links"
          style={{ gap: "0.7rem", display: "flex" }}
        >
          <NavLink
            to="/seller/dashboard"
            className={({ isActive }) =>
              isActive
                ? "admin-navbar__btn admin-navbar__btn--active"
                : "admin-navbar__btn"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/seller/products"
            className={({ isActive }) =>
              isActive
                ? "admin-navbar__btn admin-navbar__btn--active"
                : "admin-navbar__btn"
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/seller/orders"
            className={({ isActive }) =>
              isActive
                ? "admin-navbar__btn admin-navbar__btn--active"
                : "admin-navbar__btn"
            }
          >
            Orders
          </NavLink>
          <NavLink
            to="/seller/analytics"
            className={({ isActive }) =>
              isActive
                ? "admin-navbar__btn admin-navbar__btn--active"
                : "admin-navbar__btn"
            }
          >
            Analytics
          </NavLink>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            fontWeight: 500,
            color: "var(--primary)",
            background: "var(--accent)",
            borderRadius: "1.2rem",
            padding: ".5rem 1.2rem",
            fontSize: "1.08rem",
          }}
        >
          <FiUser style={{ fontSize: "1.2em" }} />
          {user?.profile?.firstName || user?.email || "Seller"}
        </span>
        <button
          className="admin-navbar__btn admin-navbar__btn--danger"
          style={{
            borderRadius: "1.2rem",
            padding: ".5rem 1.5rem",
            fontWeight: 600,
            fontSize: "1.08rem",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: ".6rem",
            cursor: "pointer",
            transition: "background 0.18s, color 0.18s",
          }}
          onClick={handleLogout}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--secondary)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--primary)")
          }
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
};

export default SellerNavbar;
