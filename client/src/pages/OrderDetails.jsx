import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getOrderById } from "../services/orderService";
import ErrorBanner from "../components/ErrorBanner";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiArrowLeft,
  FiDownload,
  FiPrinter,
  FiStar,
  FiMessageSquare,
  FiPhone,
  FiMail,
  FiHome,
  FiShoppingBag,
  FiDollarSign,
  FiShield,
  FiRefreshCw,
  FiXCircle,
  FiAlertCircle,
  FiCheck,
  FiBox,
  FiUser,
  FiSmartphone,
} from "react-icons/fi";
import "../styles/OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadOrderDetails();
  }, [orderId, user, navigate]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const orderData = await getOrderById(orderId, token);
      setOrder(orderData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="status-icon pending" />;
      case "confirmed":
        return <FiCheckCircle className="status-icon confirmed" />;
      case "processing":
        return <FiRefreshCw className="status-icon processing" />;
      case "shipped":
        return <FiTruck className="status-icon shipped" />;
      case "out_for_delivery":
        return <FiPackage className="status-icon out-for-delivery" />;
      case "delivered":
        return <FiCheckCircle className="status-icon delivered" />;
      case "cancelled":
        return <FiXCircle className="status-icon cancelled" />;
      case "refunded":
        return <FiDollarSign className="status-icon refunded" />;
      case "returned":
        return <FiBox className="status-icon returned" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#3b82f6";
      case "processing":
        return "#8b5cf6";
      case "shipped":
        return "#06b6d4";
      case "out_for_delivery":
        return "#10b981";
      case "delivered":
        return "#059669";
      case "cancelled":
        return "#ef4444";
      case "refunded":
        return "#f97316";
      case "returned":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Order Pending";
      case "confirmed":
        return "Order Confirmed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "refunded":
        return "Refunded";
      case "returned":
        return "Returned";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "razorpay":
        return <FiCreditCard />;
      case "cod":
        return <FiDollarSign />;
      case "online":
        return <FiShield />;
      case "card":
        return <FiCreditCard />;
      case "upi":
        return <FiSmartphone />;
      case "wallet":
        return <FiCreditCard />;
      default:
        return <FiCreditCard />;
    }
  };

  const getShippingMethodLabel = (method) => {
    switch (method) {
      case "standard":
        return "Standard Delivery (4-7 days)";
      case "express":
        return "Express Delivery (2-3 days)";
      case "overnight":
        return "Overnight Delivery (1 day)";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <>
        <div className="order-details-container">
          <div className="order-details-loading">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="order-details-container">
          <ErrorBanner message={error} onClose={() => setError("")} />
          <div className="order-details-error">
            <FiAlertCircle className="error-icon" />
            <h2>Unable to Load Order</h2>
            <p>{error}</p>
            <button onClick={loadOrderDetails} className="retry-btn">
              <FiRefreshCw /> Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="order-details-container">
          <div className="order-details-error">
            <FiXCircle className="error-icon" />
            <h2>Order Not Found</h2>
            <p>
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/profile" className="back-btn">
              <FiArrowLeft /> Back to Profile
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="order-details-container">
        {/* Header */}
        <div className="order-details-header">
          <div className="header-content">
            <button
              onClick={() => navigate("/profile")}
              className="back-button"
            >
              <FiArrowLeft /> Back to Orders
            </button>
            <div className="header-info">
              <h1>Order #{order.orderNumber}</h1>
              <p className="order-date">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="header-actions">
              <button className="action-btn">
                <FiDownload /> Download Invoice
              </button>
              <button className="action-btn">
                <FiPrinter /> Print
              </button>
            </div>
          </div>
        </div>

        <div className="order-details-content">
          {/* Order Status Timeline */}
          <div className="order-status-section">
            <div className="section-header">
              <h2>Order Status</h2>
              <div className="current-status">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="status-timeline">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-icon">
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{getStatusLabel(history.status)}</h4>
                        <span className="timeline-date">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                      {history.note && (
                        <p className="timeline-note">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-item">
                  <div className="timeline-icon">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{getStatusLabel(order.status)}</h4>
                      <span className="timeline-date">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-details-grid">
            {/* Order Items */}
            <div className="order-items-section">
              <div className="section-header">
                <h2>Order Items</h2>
                <span className="item-count">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-card">
                    <div className="order-item-img">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='40' y='45' font-family='Arial' font-size='10' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="order-item-img-placeholder">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="order-item-info">
                      <div className="order-item-title">{item.productName}</div>
                      <div className="order-item-meta">
                        <span className="order-item-seller">
                          Seller: {item.sellerName}
                        </span>
                        {item.className && (
                          <span className="order-item-class">
                            {item.className}
                          </span>
                        )}
                      </div>
                      <div className="order-item-bottom">
                        <span className="order-item-qty">
                          Qty: {item.quantity}
                        </span>
                        <span className="order-item-price">
                          ₹{item.price.toFixed(2)}
                        </span>
                        <span className="order-item-total">
                          Total: ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-section">
              <div className="section-header">
                <h2>Order Summary</h2>
              </div>

              <div className="summary-card">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.totals.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatCurrency(order.totals.tax)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.totals.shipping)}</span>
                </div>
                {order.totals.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.totals.discount)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(order.totals.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="shipping-section">
              <div className="section-header">
                <h2>Shipping Information</h2>
                <FiMapPin className="section-icon" />
              </div>

              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">Recipient</span>
                  <span className="info-value">
                    {order.shipping.address.name}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">
                    {order.shipping.address.phone}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">
                    {order.shipping.address.street},{" "}
                    {order.shipping.address.city},{" "}
                    {order.shipping.address.state}{" "}
                    {order.shipping.address.zipCode},{" "}
                    {order.shipping.address.country}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Shipping Method</span>
                  <span className="info-value">
                    {getShippingMethodLabel(order.shipping.method)}
                  </span>
                </div>
                {order.shipping.trackingNumber && (
                  <div className="info-item">
                    <span className="info-label">Tracking Number</span>
                    <span className="info-value tracking-number">
                      {order.shipping.trackingNumber}
                    </span>
                  </div>
                )}
                {order.shipping.estimatedDelivery && (
                  <div className="info-item">
                    <span className="info-label">Estimated Delivery</span>
                    <span className="info-value">
                      {formatDate(order.shipping.estimatedDelivery)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="payment-section">
              <div className="section-header">
                <h2>Payment Information</h2>
                <FiCreditCard className="section-icon" />
              </div>

              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">
                    {getPaymentMethodIcon(order.payment.method)}
                    {order.payment.method.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Status</span>
                  <span className={`payment-status ${order.payment.status}`}>
                    {order.payment.status.charAt(0).toUpperCase() +
                      order.payment.status.slice(1)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Amount Paid</span>
                  <span className="info-value">
                    {formatCurrency(order.payment.amount)}
                  </span>
                </div>
                {order.payment.transactionId && (
                  <div className="info-item">
                    <span className="info-label">Transaction ID</span>
                    <span className="info-value transaction-id">
                      {order.payment.transactionId}
                    </span>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="info-item">
                    <span className="info-label">Paid On</span>
                    <span className="info-value">
                      {formatDate(order.payment.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {(order.notes?.buyer ||
            order.notes?.seller ||
            order.notes?.admin) && (
            <div className="order-notes-section">
              <div className="section-header">
                <h2>Order Notes</h2>
                <FiMessageSquare className="section-icon" />
              </div>

              <div className="notes-container">
                {order.notes.buyer && (
                  <div className="note-item buyer-note">
                    <h4>Your Note</h4>
                    <p>{order.notes.buyer}</p>
                  </div>
                )}
                {order.notes.seller && (
                  <div className="note-item seller-note">
                    <h4>Seller Note</h4>
                    <p>{order.notes.seller}</p>
                  </div>
                )}
                {order.notes.admin && (
                  <div className="note-item admin-note">
                    <h4>Admin Note</h4>
                    <p>{order.notes.admin}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="order-actions">
            <button className="action-btn primary">
              <FiMessageSquare /> Contact Support
            </button>
            {order.status === "delivered" && (
              <button className="action-btn secondary">
                <FiStar /> Rate Products
              </button>
            )}
            {["pending", "confirmed"].includes(order.status) && (
              <button className="action-btn danger">
                <FiXCircle /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
