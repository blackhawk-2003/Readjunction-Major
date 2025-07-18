import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../auth/useAuth";
import ErrorBanner from "../components/ErrorBanner";
import "../styles/ProductDetails.css";
import "../styles/Cart.css";

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loading,
    error,
  } = useCartStore();
  const [msg, setMsg] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    fetchCart().catch((err) =>
      setApiError(err?.message || "Failed to fetch cart")
    );
    // eslint-disable-next-line
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="cart-page__container">
      <div className="cart-page__header-row">
        <h1 className="cart-page__title">Your Cart</h1>
        <Link to="/products" className="cart-page__continue-btn">
          Continue Shopping
        </Link>
      </div>
      <div className="cart-page__content">
        <div className="cart-page__items">
          {loading && <div>Loading cart...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {cart && cart.items && cart.items.length === 0 && (
            <div>Your cart is empty.</div>
          )}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="cart-list">
              {cart.items.map((item) => {
                const productId = item.productId._id || item.productId;
                return (
                  <div className="product-details__card" key={productId}>
                    <div className="product-details__img-wrap">
                      <img
                        src={
                          item.productImage ||
                          (item.productId &&
                            item.productId.images &&
                            item.productId.images[0] &&
                            item.productId.images[0].url) ||
                          "/placeholder-image.jpg"
                        }
                        alt={item.productName}
                        className="product-details__img"
                      />
                    </div>
                    <div className="product-details__info">
                      <h2 className="product-details__title">
                        {item.productName}
                      </h2>
                      <div className="product-details__meta">
                        <span>Seller: {item.sellerName}</span>
                      </div>
                      <div className="product-details__price-row">
                        <span className="product-details__price">
                          ₹{item.price}
                        </span>
                      </div>
                      <div className="product-details__actions-row">
                        <label htmlFor={`qty-${productId}`}>Qty:</label>
                        <input
                          id={`qty-${productId}`}
                          type="number"
                          min={1}
                          max={100}
                          value={item.quantity}
                          onChange={async (e) => {
                            try {
                              await updateCartItem(productId, {
                                quantity: Number(e.target.value),
                              });
                            } catch (err) {
                              setApiError(
                                err?.message || "Failed to update cart item"
                              );
                            }
                          }}
                          className="cart-item-qty-input"
                        />
                        <button
                          className="seller-action-btn seller-action-btn--danger cart-item-remove-btn"
                          onClick={async () => {
                            try {
                              await removeFromCart(productId);
                            } catch (err) {
                              setApiError(
                                err?.message || "Failed to remove from cart"
                              );
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="cart-page__summary">
          {cart && cart.items && cart.items.length > 0 && (
            <div className="cart-totals">
              <h3 className="cart-totals__title">Order Summary</h3>
              <div className="cart-totals__row">
                <span className="cart-totals__label">Subtotal</span>
                <span className="cart-totals__value">
                  ₹{cart.totals?.subtotal || 0}
                </span>
              </div>
              <div className="cart-totals__row">
                <span className="cart-totals__label">Tax</span>
                <span className="cart-totals__value">
                  ₹{cart.totals?.tax || 0}
                </span>
              </div>
              <div className="cart-totals__row">
                <span className="cart-totals__label">Shipping</span>
                <span className="cart-totals__value">
                  ₹{cart.totals?.shipping || 0}
                </span>
              </div>
              <div className="cart-totals__row">
                <span className="cart-totals__label">Discount</span>
                <span className="cart-totals__value">
                  -₹{cart.totals?.discount || 0}
                </span>
              </div>
              <div className="cart-totals__row cart-totals__row--total">
                <span className="cart-totals__label">Total</span>
                <span className="cart-totals__value cart-totals__value--total">
                  ₹{cart.totals?.total || 0}
                </span>
              </div>
              <button
                className="seller-action-btn seller-action-btn--danger cart-totals__clear-btn"
                onClick={async () => {
                  try {
                    await clearCart();
                    setMsg("Cart cleared");
                    setTimeout(() => setMsg(""), 2000);
                  } catch (err) {
                    setApiError(err?.message || "Failed to clear cart");
                  }
                }}
              >
                Clear Cart
              </button>
              {/* Checkout Button */}
              <button
                className="cart-totals__checkout-btn"
                onClick={() => navigate("/checkout")}
                style={{
                  marginTop: "1.2rem",
                  width: "100%",
                  fontSize: "1.12rem",
                  fontWeight: 700,
                }}
              >
                Proceed to Checkout
              </button>
              {msg && <div className="cart-totals__msg-success">{msg}</div>}
            </div>
          )}
        </div>
      </div>
      <ErrorBanner
        message={apiError || error}
        onClose={() => setApiError("")}
        type={msg ? "success" : "error"}
      />
    </div>
  );
};

export default Cart;
