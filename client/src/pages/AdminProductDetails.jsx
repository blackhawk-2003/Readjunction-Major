import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminProductDetails.css";

const PRODUCT_DETAILS_API = (id) =>
  `http://localhost:5000/api/v1/products/${id}`; // Replace with your endpoint
const APPROVE_API = (id) =>
  `http://localhost:5000/api/v1/products/admin/${id}/approve`;
const DELETE_API = (id) =>
  `http://localhost:5000/api/v1/products/admin/${id}/delete`;

const AdminProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(PRODUCT_DETAILS_API(id), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product details");
        return res.json();
      })
      .then((data) => {
        setProduct(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError("");
    const token = localStorage.getItem("adminToken");
    try {
      console.log("[DEBUG] Approving product with id:", id);
      console.log("[DEBUG] Product status:", product?.approvalStatus);
      const res = await fetch(APPROVE_API(id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: "Approved by Admin" }), // Always send a JSON body!
      });
      console.log("[DEBUG] Response status:", res.status);
      const data = await res.json().catch(() => ({}));
      console.log("[DEBUG] Response data:", data);
      if (!res.ok) throw new Error(data.message || "Failed to approve product");
      window.location.reload();
    } catch (err) {
      setActionError(err.message);
      console.error("[DEBUG] Approve error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setActionLoading(true);
    setActionError("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(DELETE_API(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      navigate("/admin/dashboard/products");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // For update, you can add a form or modal as needed
  const handleUpdate = () => {
    alert("Update functionality coming soon!");
  };

  return (
    <div>
      <AdminNavbar />
      <div className="admin-product-details-container">
        {loading && (
          <div className="admin-dashboard-loading">
            Loading product details...
          </div>
        )}
        {error && <div className="admin-dashboard-error">{error}</div>}
        {product && (
          <div className="admin-product-details-card">
            <div className="admin-product-details-header">
              <h1>{product.title}</h1>
              <div className="admin-product-details-actions">
                {product.approvalStatus === "approved" ? (
                  <span className="admin-product-status-label approved">
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="admin-product-action-btn approve"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={handleUpdate}
                  disabled={actionLoading}
                  className="admin-product-action-btn update"
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="admin-product-action-btn delete"
                >
                  Delete
                </button>
                {product.approvalStatus !== "rejected" &&
                  product.approvalStatus !== "approved" && (
                    <button
                      onClick={() => alert("Reject functionality coming soon!")}
                      disabled={actionLoading}
                      className="admin-product-action-btn reject"
                    >
                      Reject
                    </button>
                  )}
              </div>
            </div>
            <div className="admin-product-details-main">
              <div className="admin-product-details-images">
                {product.images &&
                  product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url || img}
                      alt={product.title}
                      className="admin-product-details-img"
                    />
                  ))}
              </div>
              <div className="admin-product-details-info">
                <div className="admin-product-details-row">
                  <strong>Description:</strong> {product.description}
                </div>
                <div className="admin-product-details-row">
                  <strong>Category:</strong> {product.category}
                </div>
                <div className="admin-product-details-row">
                  <strong>Approval Status:</strong> {product.approvalStatus}
                </div>
                <div className="admin-product-details-row">
                  <strong>Status:</strong> {product.status}
                </div>
                <div className="admin-product-details-row">
                  <strong>Price:</strong> ₹{product.price}
                </div>
                <div className="admin-product-details-row">
                  <strong>SKU:</strong> {product.sku}
                </div>
                <div className="admin-product-details-row">
                  <strong>Tags:</strong>{" "}
                  {product.tags && product.tags.join(", ")}
                </div>
                <div className="admin-product-details-row">
                  <strong>Inventory:</strong> {product.inventory?.quantity ?? 0}
                </div>
                <div className="admin-product-details-row">
                  <strong>Featured:</strong> {product.featured ? "Yes" : "No"}
                </div>
                <div className="admin-product-details-row">
                  <strong>Created:</strong>{" "}
                  {new Date(product.createdAt).toLocaleDateString()}
                </div>
                <div className="admin-product-details-row">
                  <strong>Updated:</strong>{" "}
                  {new Date(product.updatedAt).toLocaleDateString()}
                </div>
                <div className="admin-product-details-row">
                  <strong>Seller:</strong>{" "}
                  {product.sellerId?.businessName || "-"}
                </div>
                <div className="admin-product-details-row">
                  <strong>Ratings:</strong> {product.ratings?.average ?? 0} (
                  {product.ratings?.count ?? 0})
                </div>
                <div className="admin-product-details-row">
                  <strong>Sales:</strong> {product.sales?.totalSold ?? 0}
                </div>
                <div className="admin-product-details-row">
                  <strong>Free Shipping:</strong>{" "}
                  {product.shipping?.freeShipping ? "Yes" : "No"}
                </div>
                <div className="admin-product-details-row">
                  <strong>Specifications:</strong>{" "}
                  {product.specifications && product.specifications.length > 0
                    ? product.specifications.join(", ")
                    : "-"}
                </div>
                <div className="admin-product-details-row">
                  <strong>Variants:</strong>{" "}
                  {product.variants && product.variants.length > 0
                    ? product.variants.join(", ")
                    : "-"}
                </div>
              </div>
            </div>
            {actionError && (
              <div className="admin-dashboard-error">{actionError}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductDetails;
