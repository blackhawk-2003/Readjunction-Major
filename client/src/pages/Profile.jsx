import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLogOut,
  FiShield,
  FiHome,
  FiPackage,
  FiMapPin,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiSave,
  FiLock,
  FiEye,
  FiEyeOff,
  FiStar,
  FiBriefcase,
  FiShoppingBag,
  FiCreditCard,
  FiMoreHorizontal,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../auth/useAuth";
import UserService from "../services/userService";
import { getBuyerOrders } from "../services/orderService";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo-transparent.png";
import "./Profile.css";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState({
    type: "shipping",
    isDefault: false,
    firstName: "",
    lastName: "",
    company: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
    instructions: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Show message with auto-hide
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load user addresses
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAddresses();
      setAddresses(response.data.addresses || []);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
    loadOrders();
    // eslint-disable-next-line
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await UserService.updateProfile(profileForm);

      updateUser(response.data.user);
      showMessage("success", "Profile updated successfully");
      setShowProfileForm(false);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await UserService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showMessage("success", "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle address operations
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await UserService.addAddress(addressForm);

      showMessage("success", "Address added successfully");
      setAddressForm({
        type: "shipping",
        isDefault: false,
        firstName: "",
        lastName: "",
        company: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: "",
        instructions: "",
      });
      setShowAddAddress(false);
      loadAddresses();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await UserService.updateAddress(editingAddress._id, addressForm);

      showMessage("success", "Address updated successfully");
      setEditingAddress(null);
      setAddressForm({
        type: "shipping",
        isDefault: false,
        firstName: "",
        lastName: "",
        company: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: "",
        instructions: "",
      });
      loadAddresses();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setLoading(true);
      await UserService.deleteAddress(addressId);

      showMessage("success", "Address deleted successfully");
      loadAddresses();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      await UserService.setDefaultAddress(addressId);

      showMessage("success", "Default address updated");
      loadAddresses();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders for buyer
  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const token = localStorage.getItem("token");
      const data = await getBuyerOrders(token, { page: 1, limit: 5 });
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message || "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Edit address
  const editAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || "",
      street: address.street,
      apartment: address.apartment || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
      instructions: address.instructions || "",
    });
  };

  // Get address type icon
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <FiHome />;
      case "work":
        return <FiBriefcase />;
      case "billing":
        return <FiCreditCard />;
      case "shipping":
        return <FiShoppingBag />;
      default:
        return <FiMapPin />;
    }
  };

  // Get address type label
  const getAddressTypeLabel = (type) => {
    switch (type) {
      case "home":
        return "Home";
      case "work":
        return "Work";
      case "billing":
        return "Billing";
      case "shipping":
        return "Shipping";
      default:
        return "Other";
    }
  };

  // Helper for status badge color
  const getOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "order-status-pending";
      case "confirmed":
        return "order-status-confirmed";
      case "processing":
        return "order-status-processing";
      case "shipped":
        return "order-status-shipped";
      case "out_for_delivery":
        return "order-status-out-for-delivery";
      case "delivered":
        return "order-status-delivered";
      case "cancelled":
        return "order-status-cancelled";
      case "refunded":
        return "order-status-refunded";
      case "returned":
        return "order-status-returned";
      default:
        return "order-status-other";
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-logo">
              <img src={logoImg} alt="ReadJunction Logo" />
            </div>
            <h1>Access Denied</h1>
            <p>Please log in to view your profile</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Progress Bar */}
        {loading && (
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        )}

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: "", text: "" })}>
              <FiX />
            </button>
          </div>
        )}

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-info">
                <h3>
                  {user.profile?.firstName} {user.profile?.lastName}
                </h3>
                <p>{user.email}</p>
                <span className={`role-badge ${user.role}`}>
                  {user.role === "buyer"
                    ? "Book Buyer"
                    : user.role === "seller"
                    ? "Book Seller"
                    : "Administrator"}
                </span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  !showProfileForm &&
                  !showPasswordForm &&
                  !showAddAddress &&
                  !editingAddress
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setShowProfileForm(false);
                  setShowPasswordForm(false);
                  setShowAddAddress(false);
                  setEditingAddress(null);
                }}
              >
                <FiUser />
                <span>Profile Overview</span>
              </button>

              <button
                className={`nav-item ${showProfileForm ? "active" : ""}`}
                onClick={() => {
                  setShowProfileForm(true);
                  setShowPasswordForm(false);
                  setShowAddAddress(false);
                  setEditingAddress(null);
                  setProfileForm({
                    firstName: user.profile?.firstName || "",
                    lastName: user.profile?.lastName || "",
                  });
                }}
              >
                <FiEdit />
                <span>Edit Profile</span>
              </button>

              <button
                className={`nav-item ${showPasswordForm ? "active" : ""}`}
                onClick={() => {
                  setShowPasswordForm(true);
                  setShowProfileForm(false);
                  setShowAddAddress(false);
                  setEditingAddress(null);
                }}
              >
                <FiLock />
                <span>Change Password</span>
              </button>

              {user.role === "seller" && (
                <button
                  className="nav-item"
                  onClick={() => navigate("/seller/dashboard")}
                >
                  <FiPackage />
                  <span>Seller Dashboard</span>
                </button>
              )}

              <button className="nav-item" onClick={() => navigate("/")}>
                <FiHome />
                <span>Go Home</span>
              </button>

              <button className="nav-item logout" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Profile Overview */}
            {!showProfileForm &&
              !showPasswordForm &&
              !showAddAddress &&
              !editingAddress && (
                <div className="profile-overview">
                  <div className="section-header">
                    <h2>Profile Overview</h2>
                    <p>Your account information and settings</p>
                  </div>

                  <div className="profile-grid">
                    {/* Personal Information */}
                    <div className="profile-section">
                      <h3>Personal Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Full Name</label>
                          <p>
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                        </div>
                        <div className="info-item">
                          <label>Email Address</label>
                          <p>{user.email}</p>
                        </div>
                        <div className="info-item">
                          <label>Account Type</label>
                          <p>
                            {user.role === "buyer"
                              ? "Book Buyer"
                              : user.role === "seller"
                              ? "Book Seller"
                              : "Administrator"}
                          </p>
                        </div>
                        <div className="info-item">
                          <label>Account Status</label>
                          <span
                            className={`status-badge ${
                              user.isActive ? "active" : "inactive"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="profile-section">
                      <div className="section-header-with-action">
                        <h3>Addresses ({addresses.length})</h3>
                        <button
                          className="btn-secondary"
                          onClick={() => setShowAddAddress(true)}
                        >
                          <FiPlus />
                          Add Address
                        </button>
                      </div>

                      {addresses.length === 0 ? (
                        <div className="empty-state">
                          <FiMapPin />
                          <p>No addresses added yet</p>
                          <button
                            className="btn-primary"
                            onClick={() => setShowAddAddress(true)}
                          >
                            Add Your First Address
                          </button>
                        </div>
                      ) : (
                        <div className="addresses-grid">
                          {addresses.map((address) => (
                            <div key={address._id} className="address-card">
                              <div className="address-header">
                                <div className="address-type">
                                  {getAddressTypeIcon(address.type)}
                                  <span>
                                    {getAddressTypeLabel(address.type)}
                                  </span>
                                  {address.isDefault && (
                                    <span className="default-badge">
                                      <FiStar />
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="address-actions">
                                  <button
                                    className="btn-icon"
                                    onClick={() => editAddress(address)}
                                    title="Edit Address"
                                  >
                                    <FiEdit />
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() =>
                                      handleDeleteAddress(address._id)
                                    }
                                    title="Delete Address"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>

                              <div className="address-content">
                                <p className="address-name">
                                  {address.firstName} {address.lastName}
                                </p>
                                {address.company && (
                                  <p className="address-company">
                                    {address.company}
                                  </p>
                                )}
                                <p className="address-street">
                                  {address.street}
                                </p>
                                {address.apartment && (
                                  <p className="address-apartment">
                                    {address.apartment}
                                  </p>
                                )}
                                <p className="address-city">
                                  {address.city}, {address.state}{" "}
                                  {address.zipCode}
                                </p>
                                <p className="address-country">
                                  {address.country}
                                </p>
                                {address.phone && (
                                  <p className="address-phone">
                                    {address.phone}
                                  </p>
                                )}
                                {address.instructions && (
                                  <p className="address-instructions">
                                    {address.instructions}
                                  </p>
                                )}
                              </div>

                              {!address.isDefault && (
                                <button
                                  className="btn-text"
                                  onClick={() =>
                                    handleSetDefaultAddress(address._id)
                                  }
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* My Orders Section */}
                    <div className="profile-section profile-orders-section">
                      <div className="section-header-with-action">
                        <h3>My Orders</h3>
                        <button
                          className="btn-secondary"
                          onClick={loadOrders}
                          disabled={ordersLoading}
                        >
                          Refresh
                        </button>
                      </div>
                      {ordersLoading ? (
                        <div className="orders-loading">
                          Loading your orders...
                        </div>
                      ) : ordersError ? (
                        <div className="orders-error">{ordersError}</div>
                      ) : orders.length === 0 ? (
                        <div className="empty-state">
                          <FiShoppingBag
                            style={{ fontSize: 48, color: "#b2c8b1" }}
                          />
                          <p>You have not placed any orders yet.</p>
                        </div>
                      ) : (
                        <div className="orders-list">
                          {orders.map((order) => (
                            <div
                              className="order-card"
                              key={order._id}
                              onClick={() => navigate(`/orders/${order._id}`)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="order-card-header">
                                <div className="order-number">
                                  Order #{order.orderNumber}
                                </div>
                                <div
                                  className={`order-status-badge ${getOrderStatusClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status.replace(/_/g, " ")}
                                </div>
                              </div>
                              <div className="order-card-details">
                                <div className="order-date">
                                  <FiCalendar style={{ marginRight: 6 }} />
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="order-total">
                                  <FiCreditCard style={{ marginRight: 6 }} />
                                  <span>Total:</span> ₹{order.totals.total}
                                </div>
                              </div>
                              <div className="order-items-list">
                                {order.items.slice(0, 3).map((item) => (
                                  <div
                                    className="order-item"
                                    key={item.productId._id || item.productId}
                                  >
                                    <img
                                      src={
                                        item.productImage ||
                                        (item.productId.images &&
                                          item.productId.images[0]) ||
                                        "/placeholder-image.jpg"
                                      }
                                      alt={
                                        item.productName ||
                                        (item.productId &&
                                          item.productId.title) ||
                                        "Product"
                                      }
                                      className="order-item-img"
                                    />
                                    <div className="order-item-info">
                                      <div className="order-item-title">
                                        {item.productName ||
                                          (item.productId &&
                                            item.productId.title) ||
                                          "Product"}
                                      </div>
                                      <div className="order-item-qty">
                                        Qty: {item.quantity}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <div className="order-more-items">
                                    +{order.items.length - 3} more item(s)
                                  </div>
                                )}
                              </div>
                              <div className="order-card-footer">
                                <button
                                  className="view-details-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/orders/${order._id}`);
                                  }}
                                >
                                  View Details →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Edit Profile Form */}
            {showProfileForm && (
              <div className="profile-form-section">
                <div className="section-header">
                  <h2>Edit Profile</h2>
                  <p>Update your personal information</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowProfileForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      <FiSave />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Form */}
            {showPasswordForm && (
              <div className="profile-form-section">
                <div className="section-header">
                  <h2>Change Password</h2>
                  <p>Update your account password</p>
                </div>

                <form onSubmit={handlePasswordChange} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            current: !showPassword.current,
                          })
                        }
                      >
                        {showPassword.current ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            new: !showPassword.new,
                          })
                        }
                      >
                        {showPassword.new ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirm: !showPassword.confirm,
                          })
                        }
                      >
                        {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      <FiLock />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add/Edit Address Form */}
            {(showAddAddress || editingAddress) && (
              <div className="profile-form-section">
                <div className="section-header">
                  <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
                  <p>
                    {editingAddress
                      ? "Update your address information"
                      : "Add a new address to your account"}
                  </p>
                </div>

                <form
                  onSubmit={
                    editingAddress ? handleUpdateAddress : handleAddAddress
                  }
                  className="profile-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Address Type</label>
                      <select
                        value={addressForm.type}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              isDefault: e.target.checked,
                            })
                          }
                        />
                        Set as default for this type
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={addressForm.firstName}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={addressForm.lastName}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.company}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.apartment}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          apartment: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State/Province</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>ZIP/Postal Code</label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            zipCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            country: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Instructions (Optional)</label>
                    <textarea
                      value={addressForm.instructions}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          instructions: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowAddAddress(false);
                        setEditingAddress(null);
                        setAddressForm({
                          type: "shipping",
                          isDefault: false,
                          firstName: "",
                          lastName: "",
                          company: "",
                          street: "",
                          apartment: "",
                          city: "",
                          state: "",
                          zipCode: "",
                          country: "India",
                          phone: "",
                          instructions: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      <FiSave />
                      {editingAddress ? "Update Address" : "Add Address"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
