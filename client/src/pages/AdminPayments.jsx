import React, { useEffect, useState } from "react";
import {
  getAllOrders,
  adminUpdatePaymentStatus,
} from "../services/orderService";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css";

const paymentStatusOptions = ["pending", "completed", "failed", "refunded"];

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState("");

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const data = await getAllOrders(token, { page });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      setError("Failed to fetch payments");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      const token = localStorage.getItem("adminToken");
      await adminUpdatePaymentStatus(orderId, newStatus, token);
      fetchOrders(pagination.page);
    } catch {
      alert("Failed to update payment status");
    }
    setStatusUpdating("");
  };

  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h2 className="admin-dashboard-section-title">Payments</h2>
        {loading ? (
          <div className="admin-dashboard-loading">Loading payments...</div>
        ) : error ? (
          <div className="admin-dashboard-error">{error}</div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.buyerId?.email || "-"}</td>
                    <td>₹{order.totals?.total?.toFixed(2) || "-"}</td>
                    <td>{order.payment?.method || "-"}</td>
                    <td>
                      <select
                        value={order.payment?.status || "pending"}
                        onChange={(e) =>
                          handlePaymentStatusChange(order._id, e.target.value)
                        }
                        disabled={statusUpdating === order._id}
                        className="admin-orders-status-select"
                      >
                        {paymentStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{order.payment?.transactionId || "-"}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{/* Optionally, add more actions here */}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-orders-pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchOrders(pagination.page - 1)}
              >
                Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
