import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoImg from "../assets/logo-transparent.png";
import "../styles/AdminNavbar.css";

const adminNavLinks = [
  { label: "Orders", path: "/admin/dashboard/orders" },
  { label: "Payments", path: "/admin/dashboard/payments" },
  { label: "Buyers", path: "/admin/dashboard/buyers" },
  { label: "Sellers", path: "/admin/dashboard/sellers" },
  { label: "Products", path: "/admin/dashboard/products" },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    if (response.ok) {
      localStorage.removeItem("adminToken");
      navigate("/admin/login", {
        state: { error: "Logged out successfully" },
        logOut: true,
      });
    }
  };
  return (
    <nav className="admin-navbar">
      <div
        className="admin-navbar__logo"
        onClick={() => navigate("/admin/dashboard")}
      >
        <img
          src={logoImg}
          alt="ReadJunction Logo"
          className="admin-navbar__logo-img"
        />
        <span className="admin-navbar__logo-text">Admin Panel</span>
      </div>
      <div className="admin-navbar__links">
        {adminNavLinks.map((link) => (
          <button
            key={link.path}
            className={`admin-navbar__btn${
              location.pathname === link.path
                ? " admin-navbar__btn--active"
                : ""
            }`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
        <button className="admin-navbar__btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
