import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiHome,
  FiCalendar,
  FiBarChart,
} from "react-icons/fi";
import logoImg from "../assets/logo-transparent.png";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSellerAnalytics();
  }, []);

  const fetchSellerAnalytics = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/seller/analytics`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching seller analytics:", error);
      setError("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      processing: "#8b5cf6",
      shipped: "#06b6d4",
      out_for_delivery: "#10b981",
      delivered: "#059669",
      cancelled: "#ef4444",
      refunded: "#f97316",
      returned: "#6b7280",
    };
    return statusColors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="seller-dashboard">
        <div className="seller-dashboard__loading">
          <div className="seller-dashboard__spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-dashboard">
        <div className="seller-dashboard__error">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button
            onClick={fetchSellerAnalytics}
            className="seller-dashboard__btn seller-dashboard__btn--secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      {/* Header */}
      <header className="seller-dashboard__header">
        <div className="seller-dashboard__header-content">
          <div className="seller-dashboard__logo">
            <img src={logoImg} alt="ReadJunction Logo" />
            <span>Seller Dashboard</span>
          </div>
          <div className="seller-dashboard__user-info">
            <span>Welcome, {user?.profile?.firstName || user?.email}</span>
            <div className="seller-dashboard__actions">
              <button
                onClick={handleGoHome}
                className="seller-dashboard__btn seller-dashboard__btn--secondary"
              >
                <FiHome />
                Go to Store
              </button>
              <button
                onClick={handleLogout}
                className="seller-dashboard__btn seller-dashboard__btn--danger"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="seller-dashboard__main">
        <div className="seller-dashboard__container">
          {/* Stats Cards */}
          <div className="seller-dashboard__stats">
            <div className="seller-dashboard__stat-card">
              <div className="seller-dashboard__stat-icon">
                <FiPackage />
              </div>
              <div className="seller-dashboard__stat-content">
                <h3>{analytics?.overview?.totalProducts || 0}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className="seller-dashboard__stat-card">
              <div className="seller-dashboard__stat-icon">
                <FiDollarSign />
              </div>
              <div className="seller-dashboard__stat-content">
                <h3>{analytics?.overview?.totalRevenue || "₹0.00"}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="seller-dashboard__stat-card">
              <div className="seller-dashboard__stat-icon">
                <FiTrendingUp />
              </div>
              <div className="seller-dashboard__stat-content">
                <h3>{analytics?.overview?.totalSales || 0}</h3>
                <p>Total Sales</p>
              </div>
            </div>

            <div className="seller-dashboard__stat-card">
              <div className="seller-dashboard__stat-icon">
                <FiUsers />
              </div>
              <div className="seller-dashboard__stat-content">
                <h3>{analytics?.overview?.totalCustomers || 0}</h3>
                <p>Total Customers</p>
              </div>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="seller-dashboard__revenue-overview">
            <h2>Revenue Overview</h2>
            <div className="seller-dashboard__revenue-grid">
              <div className="seller-dashboard__revenue-card">
                <div className="seller-dashboard__revenue-icon">
                  <FiCalendar />
                </div>
                <div className="seller-dashboard__revenue-content">
                  <h4>This Month</h4>
                  <p>{analytics?.revenue?.monthly || "₹0.00"}</p>
                </div>
              </div>
              <div className="seller-dashboard__revenue-card">
                <div className="seller-dashboard__revenue-icon">
                  <FiBarChart />
                </div>
                <div className="seller-dashboard__revenue-content">
                  <h4>This Year</h4>
                  <p>{analytics?.revenue?.yearly || "₹0.00"}</p>
                </div>
              </div>
              <div className="seller-dashboard__revenue-card">
                <div className="seller-dashboard__revenue-icon">
                  <FiTrendingUp />
                </div>
                <div className="seller-dashboard__revenue-content">
                  <h4>Average Order</h4>
                  <p>{analytics?.overview?.averageOrderValue || "₹0.00"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="seller-dashboard__quick-actions">
            <h2>Quick Actions</h2>
            <div className="seller-dashboard__action-grid">
              <button
                className="seller-dashboard__action-btn"
                onClick={() => navigate("/seller/products")}
              >
                <FiPackage />
                <span>Manage Products</span>
              </button>
              <button
                className="seller-dashboard__action-btn"
                onClick={() => navigate("/seller/orders")}
              >
                <FiTrendingUp />
                <span>View Orders</span>
              </button>
              <button
                className="seller-dashboard__action-btn"
                onClick={() => navigate("/seller/analytics")}
              >
                <FiDollarSign />
                <span>Analytics</span>
              </button>
              <button
                className="seller-dashboard__action-btn"
                onClick={() => navigate("/seller/profile")}
              >
                <FiUsers />
                <span>Profile Settings</span>
              </button>
            </div>
          </div>

          {/* Top Products */}
          {analytics?.topProducts && analytics.topProducts.length > 0 && (
            <div className="seller-dashboard__top-products">
              <h2>Top Selling Products</h2>
              <div className="seller-dashboard__products-list">
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="seller-dashboard__product-item"
                  >
                    <div className="seller-dashboard__product-rank">
                      #{index + 1}
                    </div>
                    <div className="seller-dashboard__product-info">
                      <h4>{product.productName}</h4>
                      <p>Quantity: {product.quantity}</p>
                    </div>
                    <div className="seller-dashboard__product-revenue">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(product.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="seller-dashboard__recent-activity">
            <h2>Recent Activity</h2>
            <div className="seller-dashboard__activity-list">
              {analytics?.recentActivity &&
              analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="seller-dashboard__activity-item">
                    <div className="seller-dashboard__activity-icon">
                      <FiPackage />
                    </div>
                    <div className="seller-dashboard__activity-content">
                      <p>
                        Order #{activity.orderNumber} - {activity.customerName}
                        <span
                          style={{
                            color: getStatusColor(activity.status),
                            fontWeight: "600",
                            marginLeft: "8px",
                          }}
                        >
                          {activity.status}
                        </span>
                      </p>
                      <span>{formatDate(activity.timestamp)}</span>
                      <span className="seller-dashboard__activity-amount">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(activity.amount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="seller-dashboard__no-activity">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
