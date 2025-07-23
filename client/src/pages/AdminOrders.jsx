import React, { useEffect, useState } from "react";
import {
  getAllOrders,
  adminUpdateOrderStatus,
  adminGetOrderById,
} from "../services/orderService";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css";
import "../styles/OrderDetails.css";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "returned",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState("");
  const [statusNotes, setStatusNotes] = useState({}); // {orderId: note}
  const [showNoteInput, setShowNoteInput] = useState({}); // {orderId: bool}

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const data = await getAllOrders(token, { page });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      setError("Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setShowNoteInput((prev) => ({ ...prev, [orderId]: true }));
    setStatusNotes((prev) => ({ ...prev, [orderId]: "" }));
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, newStatus } : order
      )
    );
  };

  const handleNoteChange = (orderId, value) => {
    setStatusNotes((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleStatusSubmit = async (orderId) => {
    setStatusUpdating(orderId);
    const order = orders.find((o) => o._id === orderId);
    const newStatus = order.newStatus || order.status;
    const note = statusNotes[orderId];
    try {
      const token = localStorage.getItem("adminToken");
      await adminUpdateOrderStatus(orderId, newStatus, token, { note });
      fetchOrders(pagination.page);
    } catch {
      alert("Failed to update status");
    }
    setStatusUpdating("");
    setShowNoteInput((prev) => ({ ...prev, [orderId]: false }));
    setStatusNotes((prev) => ({ ...prev, [orderId]: "" }));
    setOrders((prev) =>
      prev.map((order) => {
        const { newStatus, ...rest } = order;
        return rest;
      })
    );
  };

  const openOrderDetails = async (orderId) => {
    setDetailsModal(true);
    setSelectedOrder(null);
    try {
      const token = localStorage.getItem("adminToken");
      const order = await adminGetOrderById(orderId, token);
      setSelectedOrder(order);
    } catch {
      setSelectedOrder(null);
    }
  };

  const closeModal = () => {
    setDetailsModal(false);
    setSelectedOrder(null);
  };

  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h2 className="admin-dashboard-section-title">All Orders</h2>
        {loading ? (
          <div className="admin-dashboard-loading">Loading orders...</div>
        ) : error ? (
          <div className="admin-dashboard-error">{error}</div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.buyerId?.email || "-"}</td>
                    <td>
                      <select
                        value={order.newStatus || order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={statusUpdating === order._id}
                        className="admin-orders-status-select"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      {showNoteInput[order._id] && (
                        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                          <input
                            type="text"
                            placeholder="Add note (optional)"
                            value={statusNotes[order._id] || ""}
                            onChange={(e) =>
                              handleNoteChange(order._id, e.target.value)
                            }
                            style={{
                              flex: 1,
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              padding: "0.3em 0.7em",
                            }}
                          />
                          <button
                            style={{ padding: "0.3em 1em", borderRadius: 6 }}
                            onClick={() => handleStatusSubmit(order._id)}
                            disabled={statusUpdating === order._id}
                          >
                            Save
                          </button>
                          <button
                            style={{
                              padding: "0.3em 1em",
                              borderRadius: 6,
                              background: "#eee",
                              color: "#333",
                            }}
                            onClick={() =>
                              setShowNoteInput((prev) => ({
                                ...prev,
                                [order._id]: false,
                              }))
                            }
                            disabled={statusUpdating === order._id}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                    <td>₹{order.totals?.total?.toFixed(2) || "-"}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="admin-orders-details-btn"
                        onClick={() => openOrderDetails(order._id)}
                      >
                        Details
                      </button>
                    </td>
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
        {detailsModal && selectedOrder && (
          <>
            {console.log("selectedOrder:", selectedOrder)}
            <div className="admin-orders-modal-overlay" onClick={closeModal}>
              <div
                className="admin-orders-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Order Details</h3>
                <div className="admin-orders-modal-section">
                  <strong>Order #:</strong> {selectedOrder.orderNumber || "-"}
                  <br />
                  <strong>Status:</strong> {selectedOrder.status || "-"}
                  <br />
                  <strong>Buyer:</strong> {selectedOrder.buyerId?.name || "-"} (
                  {selectedOrder.buyerId?.email || "-"})<br />
                  <strong>Total:</strong> ₹
                  {selectedOrder.totals?.total !== undefined
                    ? selectedOrder.totals.total.toFixed(2)
                    : "-"}
                  <br />
                  <strong>Created:</strong>{" "}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "-"}
                  <br />
                </div>
                <div className="admin-orders-modal-section">
                  <strong>Items:</strong>
                  <ul>
                    {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <li key={item.productId?._id || item.productId || idx}>
                          {item.productName || item.productId?.title || "-"} x{" "}
                          {item.quantity || 0} (₹{item.price || 0})
                        </li>
                      ))
                    ) : (
                      <li>No items</li>
                    )}
                  </ul>
                </div>
                <div className="admin-orders-modal-section">
                  <strong>Shipping:</strong>{" "}
                  {selectedOrder.shipping?.address ? (
                    <>
                      {selectedOrder.shipping.address.name && (
                        <span>
                          {selectedOrder.shipping.address.name}
                          <br />
                        </span>
                      )}
                      {selectedOrder.shipping.address.phone && (
                        <span>
                          {selectedOrder.shipping.address.phone}
                          <br />
                        </span>
                      )}
                      {selectedOrder.shipping.address.street && (
                        <span>{selectedOrder.shipping.address.street}, </span>
                      )}
                      {selectedOrder.shipping.address.city && (
                        <span>
                          {selectedOrder.shipping.address.city}
                          <br />
                        </span>
                      )}
                      {selectedOrder.shipping.address.state && (
                        <span>{selectedOrder.shipping.address.state}, </span>
                      )}
                      {selectedOrder.shipping.address.zipCode && (
                        <span>{selectedOrder.shipping.address.zipCode}, </span>
                      )}
                      {selectedOrder.shipping.address.country && (
                        <span>{selectedOrder.shipping.address.country}</span>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                  <br />
                  <strong>Method:</strong>{" "}
                  {selectedOrder.shipping?.method || "-"}
                  <br />
                </div>
                <button
                  className="admin-orders-modal-close"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
