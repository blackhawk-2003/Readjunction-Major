import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import "./SellerDashboard.css";
import "../styles/SellerProducts.css";

const SELLER_PRODUCTS_API =
  "http://localhost:5000/api/v1/products/seller/my-products";
const CREATE_PRODUCT_API = "http://localhost:5000/api/v1/products";
const UPDATE_PRODUCT_API = (id) =>
  `http://localhost:5000/api/v1/products/${id}`;
const DELETE_PRODUCT_API = (id) =>
  `http://localhost:5000/api/v1/products/${id}`;
const UPDATE_INVENTORY_API = (id) =>
  `http://localhost:5000/api/v1/products/${id}/inventory`;

const initialForm = {
  title: "",
  description: "",
  shortDescription: "",
  category: "",
  subcategory: "",
  brand: "",
  sku: "",
  price: "",
  comparePrice: "",
  costPrice: "",
  images: [""],
  inventory: {
    quantity: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    maxOrderQuantity: 10,
  },
  variants: [],
  specifications: [],
  tags: [],
  seo: { title: "", description: "" },
  shipping: { weight: "", dimensions: "", freeShipping: false },
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    quantity: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    maxOrderQuantity: 10,
  });
  const [inventoryProductId, setInventoryProductId] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(SELLER_PRODUCTS_API, {
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
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("inventory.")) {
      setForm((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [name.split(".")[1]]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name.startsWith("seo.")) {
      setForm((prev) => ({
        ...prev,
        seo: { ...prev.seo, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("shipping.")) {
      setForm((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          [name.split(".")[1]]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name === "images") {
      setForm((prev) => ({
        ...prev,
        images: value.split(",").map((v) => v.trim()),
      }));
    } else if (name === "tags") {
      setForm((prev) => ({
        ...prev,
        tags: value.split(",").map((v) => v.trim()),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(DELETE_PRODUCT_API(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete product");
      }
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (product) => {
    // Exclude inventory and other unused fields from the form
    const {
      inventory: _,
      ratings: __,
      sales: ___,
      approvalStatus: ____,
      approvalNotes: _____,
      sellerId: ______,
      ...rest
    } = product;
    setForm({
      ...initialForm,
      ...rest,
      images: Array.isArray(product.images)
        ? product.images.map((img) =>
            typeof img === "string" ? img : img.url || ""
          )
        : [""],
      tags: Array.isArray(product.tags) ? product.tags : [],
      seo: product.seo || { title: "", description: "" },
      shipping: product.shipping || {
        weight: "",
        dimensions: "",
        freeShipping: false,
      },
    });
    setEditMode(true);
    setEditProductId(product._id);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    const token = localStorage.getItem("token");
    try {
      let res;
      if (editMode && editProductId) {
        // Exclude inventory from update
        const { inventory: _, ...updateBody } = form;
        res = await fetch(UPDATE_PRODUCT_API(editProductId), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        });
      } else {
        res = await fetch(CREATE_PRODUCT_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message ||
            (editMode ? "Failed to update product" : "Failed to create product")
        );
      }
      setShowModal(false);
      setForm(initialForm);
      setEditMode(false);
      setEditProductId(null);
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openInventoryModal = (product) => {
    setInventoryForm({
      quantity: product.inventory?.quantity ?? 0,
      lowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
      trackInventory: product.inventory?.trackInventory ?? true,
      allowBackorder: product.inventory?.allowBackorder ?? false,
      maxOrderQuantity: product.inventory?.maxOrderQuantity ?? 10,
    });
    setInventoryProductId(product._id);
    setShowInventoryModal(true);
    setInventoryError("");
  };

  const handleInventoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInventoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    setInventoryLoading(true);
    setInventoryError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(UPDATE_INVENTORY_API(inventoryProductId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...inventoryForm, operation: "set" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update inventory");
      }
      setShowInventoryModal(false);
      setInventoryProductId(null);
      fetchProducts();
    } catch (err) {
      setInventoryError(err.message);
    } finally {
      setInventoryLoading(false);
    }
  };

  return (
    <div className="seller-dashboard">
      <SellerNavbar />
      <main className="seller-dashboard__main">
        <div className="seller-dashboard__container">
          <div className="seller-products-header-row">
            <h1>My Products</h1>
            <button
              className="admin-navbar__btn seller-form-btn seller-form-btn--primary"
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setForm(initialForm);
              }}
            >
              + Add Product
            </button>
          </div>
          {loading && <div>Loading products...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          <div className="admin-products-list">
            {products.map((product) => (
              <div className="admin-product-card" key={product._id}>
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
                  {product.status && (
                    <div
                      className={`admin-product-badge admin-product-badge--${product.status}`}
                    >
                      {product.status}
                    </div>
                  )}
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
                      <strong>Created:</strong>{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Updated:</strong>{" "}
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      gap: "0.7rem",
                    }}
                  >
                    <button
                      className="seller-action-btn seller-action-btn--primary"
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="seller-action-btn seller-action-btn--danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="seller-action-btn seller-action-btn--secondary"
                      onClick={() => openInventoryModal(product)}
                    >
                      Edit Inventory
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="seller-modal-overlay">
          <div className="seller-modal">
            <div className="seller-modal-header">
              <h2 className="seller-modal-title">
                {editMode ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setEditProductId(null);
                }}
                className="seller-modal-close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="seller-form">
              <div className="seller-form-grid">
                <div>
                  <label>Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>SKU</label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>Subcategory</label>
                  <input
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label>Brand</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label>Price</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>Compare Price</label>
                  <input
                    name="comparePrice"
                    type="number"
                    value={form.comparePrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label>Cost Price</label>
                  <input
                    name="costPrice"
                    type="number"
                    value={form.costPrice}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div>
                <label>Short Description</label>
                <input
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
              <div>
                <label>Images (comma separated URLs)</label>
                <input
                  name="images"
                  value={form.images.join(", ")}
                  onChange={handleFormChange}
                />
              </div>
              <div className="seller-form-grid">
                <div>
                  <label>Tags (comma separated)</label>
                  <input
                    name="tags"
                    value={form.tags.join(", ")}
                    onChange={handleFormChange}
                  />
                </div>
                {!editMode && (
                  <>
                    <div>
                      <label>Inventory Quantity</label>
                      <input
                        name="inventory.quantity"
                        type="number"
                        value={form.inventory.quantity}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div>
                      <label>Low Stock Threshold</label>
                      <input
                        name="inventory.lowStockThreshold"
                        type="number"
                        value={form.inventory.lowStockThreshold}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="seller-form-checkbox-row">
                      <label htmlFor="trackInventory">Track Inventory</label>
                      <input
                        id="trackInventory"
                        name="inventory.trackInventory"
                        type="checkbox"
                        checked={form.inventory.trackInventory}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="seller-form-checkbox-row">
                      <label htmlFor="allowBackorder">Allow Backorder</label>
                      <input
                        id="allowBackorder"
                        name="inventory.allowBackorder"
                        type="checkbox"
                        checked={form.inventory.allowBackorder}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div>
                      <label>Max Order Quantity</label>
                      <input
                        name="inventory.maxOrderQuantity"
                        type="number"
                        value={form.inventory.maxOrderQuantity}
                        onChange={handleFormChange}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="seller-form-grid">
                <div>
                  <label>SEO Title</label>
                  <input
                    name="seo.title"
                    value={form.seo.title}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label>SEO Description</label>
                  <input
                    name="seo.description"
                    value={form.seo.description}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="seller-form-grid">
                <div>
                  <label>Shipping Weight</label>
                  <input
                    name="shipping.weight"
                    value={form.shipping.weight}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label>Shipping Dimensions</label>
                  <input
                    name="shipping.dimensions"
                    value={form.shipping.dimensions}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="seller-form-checkbox-row">
                  <label>Free Shipping</label>
                  <input
                    name="shipping.freeShipping"
                    type="checkbox"
                    checked={form.shipping.freeShipping}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              {formError && (
                <div className="seller-form-error">{formError}</div>
              )}
              <div className="seller-form-btn-row">
                <button
                  type="button"
                  className="seller-form-btn seller-form-btn--secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditProductId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seller-form-btn seller-form-btn--primary"
                  disabled={formLoading}
                >
                  {formLoading
                    ? editMode
                      ? "Updating..."
                      : "Creating..."
                    : editMode
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Edit Inventory */}
      {showInventoryModal && (
        <div className="seller-modal-overlay">
          <div className="seller-modal">
            <div className="seller-modal-header">
              <h2 className="seller-modal-title">Edit Inventory</h2>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="seller-modal-close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleInventorySubmit} className="seller-form">
              <div className="seller-form-grid">
                <div>
                  <label>Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={handleInventoryChange}
                  />
                </div>
                <div>
                  <label>Low Stock Threshold</label>
                  <input
                    name="lowStockThreshold"
                    type="number"
                    value={inventoryForm.lowStockThreshold}
                    onChange={handleInventoryChange}
                  />
                </div>
                <div className="seller-form-checkbox-row">
                  <label htmlFor="editTrackInventory">Track Inventory</label>
                  <input
                    id="editTrackInventory"
                    name="trackInventory"
                    type="checkbox"
                    checked={inventoryForm.trackInventory}
                    onChange={handleInventoryChange}
                  />
                </div>
                <div className="seller-form-checkbox-row">
                  <label htmlFor="editAllowBackorder">Allow Backorder</label>
                  <input
                    id="editAllowBackorder"
                    name="allowBackorder"
                    type="checkbox"
                    checked={inventoryForm.allowBackorder}
                    onChange={handleInventoryChange}
                  />
                </div>
                <div>
                  <label>Max Order Quantity</label>
                  <input
                    name="maxOrderQuantity"
                    type="number"
                    value={inventoryForm.maxOrderQuantity}
                    onChange={handleInventoryChange}
                  />
                </div>
              </div>
              {inventoryError && (
                <div className="seller-form-error">{inventoryError}</div>
              )}
              <div className="seller-form-btn-row">
                <button
                  type="button"
                  className="seller-form-btn seller-form-btn--secondary"
                  onClick={() => setShowInventoryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seller-form-btn seller-form-btn--primary"
                  disabled={inventoryLoading}
                >
                  {inventoryLoading ? "Updating..." : "Update Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
