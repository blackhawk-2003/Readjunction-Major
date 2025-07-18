import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/ProductDetails.css";
import { useAuth } from "../auth/useAuth";
import { useCartStore } from "../store/cartStore";
import { useLocation } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading, error: cartError } = useCartStore();
  const [cartMsg, setCartMsg] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/v1/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
          // Use actual inventory data instead of random stock
          const inventory = data.data.inventory;
          const stockQuantity = inventory.trackInventory
            ? inventory.quantity
            : 999; // Show high stock if not tracking
          setStock(stockQuantity);
          setQuantity(1);
        } else {
          throw new Error(data.message || "Product not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setApiError(err.message || "Product not found.");
        setError(err.message || "Product not found.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setSimilarLoading(true);
    fetch(`http://localhost:5000/api/v1/products/${id}/related?limit=6`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSimilar(data.data);
        } else {
          setSimilar([]);
        }
        setSimilarLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching similar products:", err);
        setSimilar([]);
        setSimilarLoading(false);
      });
  }, [product, id]);

  return (
    <div className="product-details__container product-details__container--full">
      {loading ? (
        <div className="product-details__loading">
          <div className="product-details__spinner" />
          Loading product...
        </div>
      ) : error ? (
        <div className="product-details__error">{error}</div>
      ) : (
        <>
          <div className="product-details__card animate-in product-details__card--full">
            <button
              className="product-details__back"
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft /> Back
            </button>
            <div className="product-details__img-wrap">
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : "/placeholder-image.jpg"
                }
                alt={product.title}
                className="product-details__img"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </div>
            <div className="product-details__info">
              <h1 className="product-details__title">{product.title}</h1>
              <div className="product-details__category">
                {product.category}
              </div>
              <div className="product-details__meta">
                <span className="product-details__meta-item">
                  <strong>SKU:</strong> {product.sku}
                </span>
                {product.sellerId && (
                  <span className="product-details__meta-item">
                    <strong>Seller:</strong> {product.sellerId.businessName}
                  </span>
                )}
              </div>
              <div className="product-details__price-row">
                <div className="product-details__price-container">
                  <span className="product-details__price">
                    ${product.price}
                  </span>
                  {product.comparePrice &&
                    product.comparePrice > product.price && (
                      <span className="product-details__compare-price">
                        ${product.comparePrice}
                      </span>
                    )}
                </div>
                {stock !== null && (
                  <span
                    className={`product-details__stock-badge ${
                      stock > 0 ? "in" : "out"
                    }`}
                  >
                    {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
                  </span>
                )}
              </div>
              <p className="product-details__desc product-details__desc--left">
                {product.description}
              </p>
              <div className="product-details__actions-row">
                <label
                  htmlFor="quantity"
                  className="product-details__qty-label"
                >
                  Qty:
                </label>
                <select
                  id="quantity"
                  className="product-details__qty-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={stock === 0}
                >
                  {Array.from({ length: stock }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  className="product-details__cta"
                  disabled={stock === 0 || cartLoading}
                  onClick={async () => {
                    if (!isAuthenticated) {
                      navigate("/login", { state: { from: location } });
                      return;
                    }
                    setCartMsg("");
                    setApiError("");
                    try {
                      await addToCart({ productId: product._id, quantity });
                      if (cartError) {
                        setApiError(cartError);
                      } else {
                        setCartMsg("Added to cart!");
                        setTimeout(() => setCartMsg(""), 2000);
                      }
                    } catch (err) {
                      setApiError(
                        cartError || err?.message || "Could not add to cart"
                      );
                    }
                  }}
                >
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
              {cartMsg && (
                <div className="product-details__cart-msg">{cartMsg}</div>
              )}
            </div>
          </div>
          <div className="product-details__similar-section">
            <h2 className="product-details__similar-title">Similar Products</h2>
            {similarLoading ? (
              <div className="product-details__similar-loading">
                Loading similar products...
              </div>
            ) : (
              <div className="product-details__similar-grid">
                {similar.map((sp) => (
                  <div className="product-details__similar-card" key={sp._id}>
                    <div className="product-details__similar-img-wrap">
                      <img
                        src={
                          sp.images && sp.images.length > 0
                            ? sp.images[0].url
                            : "/placeholder-image.jpg"
                        }
                        alt={sp.title}
                        className="product-details__similar-img"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="product-details__similar-info">
                      <div className="product-details__similar-title-txt">
                        {sp.title}
                      </div>
                      <div className="product-details__similar-price">
                        ${sp.price}
                        {sp.comparePrice && sp.comparePrice > sp.price && (
                          <span className="product-details__similar-compare-price">
                            ${sp.comparePrice}
                          </span>
                        )}
                      </div>
                      <button
                        className="product-details__similar-btn"
                        onClick={() => navigate(`/products/${sp._id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ErrorBanner message={apiError} onClose={() => setApiError("")} />
        </>
      )}
    </div>
  );
};

export default ProductDetails;
