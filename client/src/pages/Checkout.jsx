import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import "../styles/Cart.css";
import ProgressBar from "../components/ProgressBar";
import ErrorBanner from "../components/ErrorBanner";
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/orderService";
import UserService from "../services/userService";
import { FiHome, FiMapPin, FiEdit, FiCheckCircle } from "react-icons/fi";

function RazorpayPaymentStep({
  cart,
  shipping,
  onBack,
  onSuccess,
  setError,
  setLoading,
}) {
  const [processing, setProcessing] = useState(false);

  // Calculate total for Razorpay
  const total = cart?.totals?.total || 0;

  // Handler for Razorpay payment
  const handlePayment = async () => {
    setProcessing(true);
    setLoading(true);
    setError("");

    try {
      // 1. Create order in backend
      const token = localStorage.getItem("token");
      const orderData = {
        items: cart.items.map((item) => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
        })),
        payment: { method: "razorpay" },
        shipping: {
          address: {
            name: shipping.name,
            phone: shipping.phone,
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zipCode,
            country: shipping.country,
          },
          method: shipping.method,
        },
      };

      const order = await createOrder(orderData, token);

      // 2. Create Razorpay order
      const razorpayOrderData = await createRazorpayOrder(order._id, token);
      console.log("razorpayOrderData:", razorpayOrderData);

      // Defensive check for backend response
      if (
        !razorpayOrderData ||
        !razorpayOrderData.razorpayOrderId ||
        !razorpayOrderData.key
      ) {
        setProcessing(false);
        setLoading(false);
        setError(
          (razorpayOrderData && razorpayOrderData.error) ||
            "Failed to create Razorpay order. Please try again or contact support."
        );
        return;
      }

      // 3. Initialize Razorpay checkout
      const options = {
        key: razorpayOrderData.key,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: "ReadJunction",
        description: "Book Purchase",
        order_id: razorpayOrderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // 4. Verify payment with backend
            await verifyRazorpayPayment(
              {
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              token
            );

            setProcessing(false);
            setLoading(false);
            onSuccess();
          } catch (err) {
            setProcessing(false);
            setLoading(false);
            setError(
              err?.response?.data?.message ||
                err.message ||
                "Payment verification failed"
            );
          }
        },
        prefill: {
          name: shipping.name,
          email: localStorage.getItem("userEmail") || "",
          contact: shipping.phone,
        },
        notes: {
          address: `${shipping.street}, ${shipping.city}, ${shipping.state}`,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setLoading(false);
      setError(err?.response?.data?.message || err.message || "Payment failed");
    }
  };

  return (
    <div className="razorpay-payment-container">
      <div className="razorpay-payment-card">
        {/* Header */}
        <div className="razorpay-header">
          <div className="razorpay-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3399cc" />
              <path d="M2 17L12 22L22 17" stroke="#3399cc" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#3399cc" strokeWidth="2" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <h2 className="razorpay-title">Complete Your Purchase</h2>
          <p className="razorpay-subtitle">
            Your payment is protected by Razorpay's secure infrastructure
          </p>
        </div>

        {/* Order Summary */}
        <div className="razorpay-order-summary">
          <div className="summary-header">
            <h3>Order Summary</h3>
            <div className="summary-badge">
              <span className="badge-icon">📦</span>
              {cart?.items?.length || 0} items
            </div>
          </div>

          <div className="summary-items">
            <div className="summary-item">
              <span className="item-label">Subtotal</span>
              <span className="item-value">₹{cart?.totals?.subtotal || 0}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Tax</span>
              <span className="item-value">₹{cart?.totals?.tax || 0}</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Shipping</span>
              <span className="item-value">₹{cart?.totals?.shipping || 0}</span>
            </div>
          </div>

          <div className="summary-total">
            <span className="total-label">Total Amount</span>
            <span className="total-value">₹{total}</span>
          </div>
        </div>

        {/* Payment Button */}
        <div className="razorpay-actions">
          <button
            className="razorpay-pay-button"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="spinner"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <span className="pay-icon">💳</span>
                Pay ₹{total}
              </>
            )}
          </button>

          <button
            className="razorpay-back-button"
            onClick={onBack}
            disabled={processing}
          >
            ← Back to Review
          </button>
        </div>

        {/* Security Info */}
        <div className="razorpay-security">
          <div className="security-item">
            <span className="security-icon">🔒</span>
            <span>256-bit SSL encryption</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🛡️</span>
            <span>PCI DSS compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Checkout = () => {
  // const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();

  // UI state
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    method: "standard",
  });
  const [shippingTouched, setShippingTouched] = useState({});

  // Address selection state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Animation helpers
  const fadeIn = {
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  };

  // Validation
  const isShippingValid =
    shipping.name &&
    shipping.phone &&
    shipping.street &&
    shipping.city &&
    shipping.state &&
    shipping.zipCode &&
    shipping.country;

  // Handlers
  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    setShippingTouched({ ...shippingTouched, [e.target.name]: true });
  };

  const handleSuccess = () => setStep(4);

  // Add this function to check and show errors on submit
  const handleShippingNext = () => {
    if (!isShippingValid) {
      setError("Please fill in all required shipping fields.");
      setShippingTouched({
        name: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
      });
      return;
    }
    setError("");
    setStep(2);
  };

  // Fetch addresses on mount (shipping step)
  useEffect(() => {
    if (step === 1) {
      setAddressLoading(true);
      UserService.getAddresses()
        .then((res) => {
          setAddresses(res.data.addresses || []);
          setAddressLoading(false);
        })
        .catch(() => setAddressLoading(false));
    }
  }, [step]);

  // Autofill shipping form when address is selected
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const addr = addresses.find((a) => a._id === selectedAddressId);
      if (addr) {
        setShipping({
          name: `${addr.firstName} ${addr.lastName}`,
          phone: addr.phone || "",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          zipCode: addr.zipCode || "",
          country: addr.country || "India",
          method: shipping.method || "standard",
        });
      }
    }
  }, [selectedAddressId, addresses]);

  // Step content
  const renderShippingForm = () => (
    <div className="checkout-step-card" style={fadeIn}>
      <h2 className="checkout-step-title">Shipping Information</h2>
      {/* Address selection UI */}
      {addressLoading ? (
        <div style={{ marginBottom: 16 }}>Loading saved addresses...</div>
      ) : addresses.length > 0 ? (
        <div className="checkout-address-list" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Choose a saved address:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`checkout-address-card${
                  selectedAddressId === addr._id ? " selected" : ""
                }`}
                style={{
                  border:
                    selectedAddressId === addr._id
                      ? "2px solid var(--primary)"
                      : "1.5px solid #e3e8f0",
                  background:
                    selectedAddressId === addr._id ? "#e9f0e1" : "#f9fafd",
                  borderRadius: 12,
                  padding: 16,
                  minWidth: 220,
                  cursor: "pointer",
                  boxShadow:
                    selectedAddressId === addr._id
                      ? "0 2px 12px rgba(75,104,68,0.10)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  position: "relative",
                  transition: "all 0.18s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
                onClick={() => setSelectedAddressId(addr._id)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {UserService.getAddressTypeIcon(addr.type)}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {addr.firstName} {addr.lastName}
                  </span>
                  {addr.isDefault && (
                    <span
                      style={{ color: "#4b6844", fontSize: 16, marginLeft: 6 }}
                      title="Default"
                    >
                      <FiCheckCircle />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: "#555" }}>
                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                </div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  {addr.country} {addr.phone && `| ${addr.phone}`}
                </div>
                {selectedAddressId === addr._id && (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "#4b6844",
                      fontSize: 20,
                    }}
                  >
                    <FiCheckCircle />
                  </span>
                )}
              </div>
            ))}
            <div
              className={`checkout-address-card${
                !selectedAddressId ? " selected" : ""
              }`}
              style={{
                border: !selectedAddressId
                  ? "2px solid var(--primary)"
                  : "1.5px dashed #b2c8b1",
                background: !selectedAddressId ? "#e9f0e1" : "#f9fafd",
                borderRadius: 12,
                padding: 16,
                minWidth: 220,
                cursor: "pointer",
                boxShadow: !selectedAddressId
                  ? "0 2px 12px rgba(75,104,68,0.10)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4b6844",
                fontWeight: 600,
                fontSize: 15,
                transition: "all 0.18s",
              }}
              onClick={() => setSelectedAddressId(null)}
            >
              <FiMapPin style={{ marginRight: 8 }} /> New Address
            </div>
          </div>
        </div>
      ) : null}
      {/* Manual entry form (always shown, autofilled if address selected) */}
      <form className="checkout-form" autoComplete="off">
        <div className="checkout-form-row">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={shipping.name}
            onChange={handleShippingChange}
            className={
              shippingTouched.name && !shipping.name ? "input-error" : ""
            }
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={shipping.phone}
            onChange={handleShippingChange}
            className={
              shippingTouched.phone && !shipping.phone ? "input-error" : ""
            }
            required
          />
        </div>
        <div className="checkout-form-row">
          <input
            type="text"
            name="street"
            placeholder="Street Address"
            value={shipping.street}
            onChange={handleShippingChange}
            className={
              shippingTouched.street && !shipping.street ? "input-error" : ""
            }
            required
          />
        </div>
        <div className="checkout-form-row">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shipping.city}
            onChange={handleShippingChange}
            className={
              shippingTouched.city && !shipping.city ? "input-error" : ""
            }
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={shipping.state}
            onChange={handleShippingChange}
            className={
              shippingTouched.state && !shipping.state ? "input-error" : ""
            }
            required
          />
        </div>
        <div className="checkout-form-row">
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={shipping.zipCode}
            onChange={handleShippingChange}
            className={
              shippingTouched.zipCode && !shipping.zipCode ? "input-error" : ""
            }
            required
          />
          <select
            name="country"
            value={shipping.country}
            onChange={handleShippingChange}
            required
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="checkout-form-row">
          <label className="checkout-label">Shipping Method:</label>
          <select
            name="method"
            value={shipping.method}
            onChange={handleShippingChange}
            className="checkout-shipping-method"
          >
            <option value="standard">Standard (₹50, 4-7 days)</option>
            <option value="express">Express (₹100, 2-3 days)</option>
            <option value="overnight">Overnight (₹200, 1 day)</option>
          </select>
        </div>
        <button
          type="button"
          className="checkout-next-btn"
          onClick={handleShippingNext}
        >
          Continue to Review
        </button>
      </form>
    </div>
  );

  // Placeholder image for products without images
  const placeholderImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='30' y='35' font-family='Arial' font-size='12' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

  const renderReview = () => (
    <div className="checkout-step-card" style={fadeIn}>
      <h2 className="checkout-step-title">Review Your Order</h2>
      <div className="checkout-review-section">
        <div className="checkout-review-items">
          {cart && cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div
                className="checkout-review-item"
                key={item.productId._id || item.productId}
              >
                <img
                  src={
                    item.productImage ||
                    (item.productId &&
                      item.productId.images &&
                      item.productId.images[0] &&
                      (item.productId.images[0].url ||
                        item.productId.images[0])) ||
                    placeholderImage
                  }
                  alt={
                    item.productName ||
                    (item.productId && item.productId.title) ||
                    "Product"
                  }
                  className="checkout-review-img"
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
                <div className="checkout-review-info">
                  <div className="checkout-review-title">
                    {item.productName ||
                      (item.productId && item.productId.title) ||
                      "Product"}
                  </div>
                  <div className="checkout-review-meta">
                    Seller:{" "}
                    {item.sellerName ||
                      (item.productId && item.productId.sellerName) ||
                      "Unknown"}
                  </div>
                  <div className="checkout-review-price">
                    ₹{item.price} x {item.quantity}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>Your cart is empty.</div>
          )}
        </div>
        <div className="checkout-review-summary">
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>₹{cart?.totals?.subtotal ?? 0}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Tax</span>
            <span>₹{cart?.totals?.tax ?? 0}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>₹{cart?.totals?.shipping ?? 0}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Discount</span>
            <span>-₹{cart?.totals?.discount ?? 0}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>₹{cart?.totals?.total ?? 0}</span>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
        }}
      >
        <button className="checkout-back-btn" onClick={() => setStep(1)}>
          Back
        </button>
        <button className="checkout-next-btn" onClick={() => setStep(3)}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div
      className="checkout-step-card checkout-confirmation-card"
      style={fadeIn}
    >
      <div className="checkout-confirmation-icon">🎉</div>
      <h2 className="checkout-step-title">Order Placed Successfully!</h2>
      <div className="checkout-confirmation-msg">
        Thank you for your purchase. Your order has been placed and a
        confirmation email will be sent to you.
      </div>
      <button
        className="checkout-next-btn"
        onClick={() => navigate("/products")}
      >
        Continue Shopping
      </button>
    </div>
  );

  // Main render
  return (
    <>
      <ProgressBar loading={loading} text={loading && "Processing..."} />
      <ErrorBanner message={error} onClose={() => setError("")} />
      <div className="checkout-page__wrapper">
        <div className="checkout-steps-bar">
          <div
            className={`checkout-step-dot${
              step === 1 ? " active" : step > 1 ? " done" : ""
            }`}
          >
            1
          </div>
          <div className="checkout-step-line"></div>
          <div
            className={`checkout-step-dot${
              step === 2 ? " active" : step > 2 ? " done" : ""
            }`}
          >
            2
          </div>
          <div className="checkout-step-line"></div>
          <div
            className={`checkout-step-dot${
              step === 3 ? " active" : step > 3 ? " done" : ""
            }`}
          >
            3
          </div>
          <div className="checkout-step-line"></div>
          <div className={`checkout-step-dot${step === 4 ? " active" : ""}`}>
            4
          </div>
        </div>
        <div className="checkout-step-content">
          {step === 1 && renderShippingForm()}
          {step === 2 && renderReview()}
          {step === 3 && (
            <RazorpayPaymentStep
              cart={cart}
              shipping={shipping}
              onBack={() => setStep(2)}
              onSuccess={handleSuccess}
              setError={setError}
              setLoading={setLoading}
            />
          )}
          {step === 4 && renderConfirmation()}
        </div>
      </div>
    </>
  );
};

export default Checkout;
