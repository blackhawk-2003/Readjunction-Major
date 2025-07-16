import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetch("http://localhost:5000/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data && data.data.user) {
          setUser(data.data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login", {
          state: { error: "Session expired. Please login again." },
        });
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    setStatsLoading(true);
    fetch("http://localhost:5000/api/v1/products/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        return res.json();
      })
      .then((data) => {
        if (data.data && data.data.stats) {
          setStats(data.data.stats);
        }
        setStatsLoading(false);
      })
      .catch((err) => {
        setStatsError(err.message);
        setStatsLoading(false);
      });
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h1 className="admin-dashboard-title">Welcome, Admin!</h1>
        {user && (
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-row">
              <span className="admin-dashboard-label">Name:</span>
              <span className="admin-dashboard-value">
                {user.profile.firstName} {user.profile.lastName}
              </span>
            </div>
            <div className="admin-dashboard-row">
              <span className="admin-dashboard-label">Email:</span>
              <span className="admin-dashboard-value">{user.email}</span>
            </div>
            <div className="admin-dashboard-row">
              <span className="admin-dashboard-label">First Name:</span>
              <span className="admin-dashboard-value">
                {user.profile.firstName}
              </span>
            </div>
            <div className="admin-dashboard-row">
              <span className="admin-dashboard-label">Last Name:</span>
              <span className="admin-dashboard-value">
                {user.profile.lastName}
              </span>
            </div>
            <div className="admin-dashboard-row">
              <span className="admin-dashboard-label">Role:</span>
              <span className="admin-dashboard-value admin-dashboard-role">
                {user.role}
              </span>
            </div>
          </div>
        )}
        <h2 className="admin-dashboard-section-title">Product Statistics</h2>
        {statsLoading && (
          <div className="admin-dashboard-loading">Loading stats...</div>
        )}
        {statsError && (
          <div className="admin-dashboard-error">{statsError}</div>
        )}
        {stats && (
          <div className="admin-dashboard-stats-grid">
            {Object.entries(stats).map(([key, value]) => (
              <div className="admin-dashboard-stat-card" key={key}>
                <div className="admin-dashboard-stat-label">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </div>
                <div className="admin-dashboard-stat-value">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
