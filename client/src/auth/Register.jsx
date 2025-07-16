import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "./useAuth";
import logoImg from "../assets/logo-transparent.png";
import "./auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "buyer",
    businessInfo: {
      businessName: "",
      businessDescription: "",
      businessType: "retail",
      taxId: "",
      businessAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      bankDetails: {
        accountNumber: "",
        routingNumber: "",
        accountHolderName: "",
        bankName: "",
      },
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [name]: value,
      },
    }));
    if (error) setError("");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        businessAddress: {
          ...prev.businessInfo.businessAddress,
          [name]: value,
        },
      },
    }));
    if (error) setError("");
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        bankDetails: {
          ...prev.businessInfo.bankDetails,
          [name]: value,
        },
      },
    }));
    if (error) setError("");
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.role === "seller") {
      const { businessInfo } = formData;
      if (
        !businessInfo.businessName ||
        !businessInfo.taxId ||
        !businessInfo.businessAddress.street ||
        !businessInfo.businessAddress.city ||
        !businessInfo.businessAddress.state ||
        !businessInfo.businessAddress.zipCode ||
        !businessInfo.businessAddress.country ||
        !businessInfo.bankDetails.accountNumber ||
        !businessInfo.bankDetails.routingNumber ||
        !businessInfo.bankDetails.accountHolderName ||
        !businessInfo.bankDetails.bankName
      ) {
        setError("Please fill in all business information fields");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };

      if (formData.role === "seller") {
        userData.businessInfo = formData.businessInfo;
      }

      const result = await register(userData);

      if (result.success) {
        setSuccess("Registration successful! Redirecting...");

        // Redirect based on user role
        setTimeout(() => {
          if (result.data.user.role === "seller") {
            navigate("/seller/dashboard");
          } else {
            // Default for buyers
            navigate("/");
          }
        }, 2000);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={logoImg}
              alt="ReadJunction Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "inherit",
              }}
            />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join ReadJunction and start your journey
          </p>
        </div>

        {error && (
          <div className="message error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <FiCheck />
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I want to:</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${
                  formData.role === "buyer" ? "selected" : ""
                }`}
                onClick={() => handleRoleChange("buyer")}
                disabled={loading}
              >
                Buy Books
              </button>
              <button
                type="button"
                className={`role-option ${
                  formData.role === "seller" ? "selected" : ""
                }`}
                onClick={() => handleRoleChange("seller")}
                disabled={loading}
              >
                Sell Books
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <div style={{ position: "relative" }}>
                <FiUser
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-light)",
                    zIndex: 1,
                  }}
                />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`form-input ${
                    error && !formData.firstName ? "error" : ""
                  }`}
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ paddingLeft: "48px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-input ${
                  error && !formData.lastName ? "error" : ""
                }`}
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <FiMail
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  zIndex: 1,
                }}
              />
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${
                  error && !formData.email ? "error" : ""
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                style={{ paddingLeft: "48px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input">
              <FiLock
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  zIndex: 1,
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${
                  error && !formData.password ? "error" : ""
                }`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                style={{ paddingLeft: "48px" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input">
              <FiLock
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                  zIndex: 1,
                }}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${
                  error && !formData.confirmPassword ? "error" : ""
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                style={{ paddingLeft: "48px" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Business Information for Sellers */}
          {formData.role === "seller" && (
            <div
              className={`business-info ${
                formData.role === "seller" ? "active" : ""
              }`}
            >
              <h4>Business Information</h4>

              <div className="form-group">
                <label htmlFor="businessName" className="form-label">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  className={`form-input ${
                    error && !formData.businessInfo.businessName ? "error" : ""
                  }`}
                  placeholder="Your business name"
                  value={formData.businessInfo.businessName}
                  onChange={handleBusinessChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessDescription" className="form-label">
                  Business Description
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  className="form-input"
                  placeholder="Brief description of your business"
                  value={formData.businessInfo.businessDescription}
                  onChange={handleBusinessChange}
                  disabled={loading}
                  rows="3"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="taxId" className="form-label">
                  Tax ID
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  className={`form-input ${
                    error && !formData.businessInfo.taxId ? "error" : ""
                  }`}
                  placeholder="Tax identification number"
                  value={formData.businessInfo.taxId}
                  onChange={handleBusinessChange}
                  disabled={loading}
                />
              </div>

              <h4>Business Address</h4>
              <div className="address-fields">
                <div className="form-group">
                  <label htmlFor="street" className="form-label">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    className={`form-input ${
                      error && !formData.businessInfo.businessAddress.street
                        ? "error"
                        : ""
                    }`}
                    placeholder="Street address"
                    value={formData.businessInfo.businessAddress.street}
                    onChange={handleAddressChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-input ${
                      error && !formData.businessInfo.businessAddress.city
                        ? "error"
                        : ""
                    }`}
                    placeholder="City"
                    value={formData.businessInfo.businessAddress.city}
                    onChange={handleAddressChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className={`form-input ${
                      error && !formData.businessInfo.businessAddress.state
                        ? "error"
                        : ""
                    }`}
                    placeholder="State"
                    value={formData.businessInfo.businessAddress.state}
                    onChange={handleAddressChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode" className="form-label">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className={`form-input ${
                      error && !formData.businessInfo.businessAddress.zipCode
                        ? "error"
                        : ""
                    }`}
                    placeholder="ZIP code"
                    value={formData.businessInfo.businessAddress.zipCode}
                    onChange={handleAddressChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className={`form-input ${
                      error && !formData.businessInfo.businessAddress.country
                        ? "error"
                        : ""
                    }`}
                    placeholder="Country"
                    value={formData.businessInfo.businessAddress.country}
                    onChange={handleAddressChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <h4>Bank Details</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label htmlFor="accountNumber" className="form-label">
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    className={`form-input ${
                      error && !formData.businessInfo.bankDetails.accountNumber
                        ? "error"
                        : ""
                    }`}
                    placeholder="Account number"
                    value={formData.businessInfo.bankDetails.accountNumber}
                    onChange={handleBankChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="routingNumber" className="form-label">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    className={`form-input ${
                      error && !formData.businessInfo.bankDetails.routingNumber
                        ? "error"
                        : ""
                    }`}
                    placeholder="Routing number"
                    value={formData.businessInfo.bankDetails.routingNumber}
                    onChange={handleBankChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="accountHolderName" className="form-label">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    id="accountHolderName"
                    name="accountHolderName"
                    className={`form-input ${
                      error &&
                      !formData.businessInfo.bankDetails.accountHolderName
                        ? "error"
                        : ""
                    }`}
                    placeholder="Account holder name"
                    value={formData.businessInfo.bankDetails.accountHolderName}
                    onChange={handleBankChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankName" className="form-label">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    className={`form-input ${
                      error && !formData.businessInfo.bankDetails.bankName
                        ? "error"
                        : ""
                    }`}
                    placeholder="Bank name"
                    value={formData.businessInfo.bankDetails.bankName}
                    onChange={handleBankChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`auth-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
