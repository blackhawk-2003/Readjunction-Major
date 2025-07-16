import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css";
import "../styles/AdminProductCard.css";
import "../styles/AdminProductFilter.css";
import { Link, useNavigate } from "react-router-dom";

const ADMIN_PRODUCTS_API =
  "http://localhost:5000/api/v1/products/admin/unfiltered"; // Replace with your endpoint

const approvalOptions = ["pending", "approved", "rejected"];

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState({
    category: "",
    approvalStatus: "",
    featured: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetch(ADMIN_PRODUCTS_API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const handleFilterChange = (e) => {
    setFilter((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSidebarOpen(false);
  };

  // Filter products client-side
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      !filter.category || product.category === filter.category;
    const matchApproval =
      !filter.approvalStatus ||
      product.approvalStatus === filter.approvalStatus;
    const matchFeatured =
      !filter.featured ||
      (filter.featured === "yes" ? product.featured : !product.featured);
    return matchCategory && matchApproval && matchFeatured;
  });

  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <div className="admin-products-header-row">
          <h1 className="admin-dashboard-title">All Products</h1>
          <button
            className="admin-filter-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open filters"
          >
            <span className="admin-filter-hamburger-bar"></span>
            <span className="admin-filter-hamburger-bar"></span>
            <span className="admin-filter-hamburger-bar"></span>
          </button>
        </div>
        {sidebarOpen && (
          <div
            className="admin-filter-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <aside
          className={`admin-filter-sidebar${
            sidebarOpen ? " admin-filter-sidebar--open" : ""
          }`}
        >
          <div className="admin-filter-sidebar-header">
            <h2>Filter Products</h2>
            <button
              className="admin-filter-close"
              onClick={() => setSidebarOpen(false)}
            >
              &times;
            </button>
          </div>
          <div className="admin-filter-group">
            <label>Category</label>
            <select
              value={filter.category}
              onChange={handleFilterChange}
              name="category"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter-group">
            <label>Approval Status</label>
            <select
              value={filter.approvalStatus}
              onChange={handleFilterChange}
              name="approvalStatus"
            >
              <option value="">All</option>
              {approvalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter-group">
            <label>Featured</label>
            <select
              value={filter.featured}
              onChange={handleFilterChange}
              name="featured"
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </aside>
        {loading && (
          <div className="admin-dashboard-loading">Loading products...</div>
        )}
        {error && <div className="admin-dashboard-error">{error}</div>}
        <div className="admin-products-list">
          {filteredProducts.map((product) => (
            <Link
              key={product._id}
              to={`/admin/products/${product._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="admin-product-card">
                <div className="admin-product-img-wrap">
                  <img
                    src={
                      product.images && product.images[0]
                        ? product.images[0].url || product.images[0]
                        : "/placeholder.png"
                    }
                    alt={product.title}
                    className="admin-product-img"
                  />
                  {/* Show only one badge - either approval status or active status */}
                  {product.approvalStatus &&
                  product.approvalStatus !== "approved" ? (
                    <div
                      className={`admin-product-badge admin-product-badge--${product.approvalStatus}`}
                    >
                      {product.approvalStatus}
                    </div>
                  ) : product.status && product.status !== "draft" ? (
                    <div
                      className={`admin-product-badge admin-product-badge--${product.status}`}
                    >
                      {product.status}
                    </div>
                  ) : product.approvalStatus === "approved" ? (
                    <div className="admin-product-badge admin-product-badge--approved">
                      approved
                    </div>
                  ) : null}
                </div>
                <div className="admin-product-details">
                  <h2 className="admin-product-title">{product.title}</h2>
                  <div className="admin-product-meta">
                    <span className="admin-product-price">
                      ₹{product.price}
                    </span>
                    <span className="admin-product-category-badge">
                      {product.category}
                    </span>
                    <span className="admin-product-sku">
                      SKU: {product.sku}
                    </span>
                  </div>
                  <div className="admin-product-desc">
                    {product.description}
                  </div>
                  <div className="admin-product-tags">
                    {product.tags &&
                      product.tags.map((tag) => (
                        <span className="admin-product-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                  </div>
                  <div className="admin-product-info-grid">
                    <div>
                      <strong>Inventory:</strong>{" "}
                      {product.inventory?.quantity ?? 0}
                    </div>
                    <div>
                      <strong>Featured:</strong>{" "}
                      {product.featured ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Created:</strong>{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Updated:</strong>{" "}
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Seller:</strong>{" "}
                      {product.sellerId?.businessName || "-"}
                    </div>
                    <div>
                      <strong>Ratings:</strong> {product.ratings?.average ?? 0}{" "}
                      ({product.ratings?.count ?? 0})
                    </div>
                    <div>
                      <strong>Sales:</strong> {product.sales?.totalSold ?? 0}
                    </div>
                    <div>
                      <strong>Free Shipping:</strong>{" "}
                      {product.shipping?.freeShipping ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
