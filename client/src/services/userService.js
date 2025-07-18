// User API Service
// Handles all user-related API calls including profile management and address operations

const API_BASE = "http://localhost:5000/api/v1";

class UserService {
  // Helper method to get auth token
  static getToken() {
    return localStorage.getItem("token");
  }

  // Helper method to make authenticated API calls
  static async apiCall(endpoint, options = {}) {
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  // Profile Management
  static async getProfile() {
    return this.apiCall("/users/profile");
  }

  static async updateProfile(profileData) {
    return this.apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  static async changePassword(passwordData) {
    return this.apiCall("/users/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  static async deleteAccount() {
    return this.apiCall("/users/account", {
      method: "DELETE",
    });
  }

  // Address Management
  static async getAddresses() {
    return this.apiCall("/users/addresses");
  }

  static async addAddress(addressData) {
    return this.apiCall("/users/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  }

  static async updateAddress(addressId, addressData) {
    return this.apiCall(`/users/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  }

  static async deleteAddress(addressId) {
    return this.apiCall(`/users/addresses/${addressId}`, {
      method: "DELETE",
    });
  }

  static async setDefaultAddress(addressId) {
    return this.apiCall(`/users/addresses/${addressId}/default`, {
      method: "PUT",
    });
  }

  // Address validation helpers
  static validateAddress(address) {
    const errors = {};

    if (!address.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!address.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!address.street?.trim()) {
      errors.street = "Street address is required";
    }

    if (!address.city?.trim()) {
      errors.city = "City is required";
    }

    if (!address.state?.trim()) {
      errors.state = "State/Province is required";
    }

    if (!address.zipCode?.trim()) {
      errors.zipCode = "ZIP/Postal code is required";
    }

    if (!address.country?.trim()) {
      errors.country = "Country is required";
    }

    if (address.phone && !/^[+]?[1-9][\d]{0,15}$/.test(address.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Profile validation helpers
  static validateProfile(profile) {
    const errors = {};

    if (!profile.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (profile.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (profile.firstName.length > 50) {
      errors.firstName = "First name cannot exceed 50 characters";
    }

    if (!profile.lastName?.trim()) {
      errors.lastName = "Last name is required";
    } else if (profile.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    } else if (profile.lastName.length > 50) {
      errors.lastName = "Last name cannot exceed 50 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Password validation helpers
  static validatePassword(passwordData) {
    const errors = {};

    if (!passwordData.currentPassword?.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword?.trim()) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    } else if (passwordData.newPassword.length > 128) {
      errors.newPassword = "New password cannot exceed 128 characters";
    }

    if (!passwordData.confirmPassword?.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Address type helpers
  static getAddressTypes() {
    return [
      { value: "home", label: "Home", icon: "🏠" },
      { value: "work", label: "Work", icon: "💼" },
      { value: "shipping", label: "Shipping", icon: "📦" },
      { value: "billing", label: "Billing", icon: "💳" },
      { value: "other", label: "Other", icon: "📍" },
    ];
  }

  static getAddressTypeLabel(type) {
    const addressTypes = this.getAddressTypes();
    const addressType = addressTypes.find((t) => t.value === type);
    return addressType ? addressType.label : "Other";
  }

  static getAddressTypeIcon(type) {
    const addressTypes = this.getAddressTypes();
    const addressType = addressTypes.find((t) => t.value === type);
    return addressType ? addressType.icon : "📍";
  }

  // Format address for display
  static formatAddress(address) {
    const parts = [
      address.firstName && address.lastName
        ? `${address.firstName} ${address.lastName}`
        : null,
      address.company,
      address.street,
      address.apartment,
      address.city && address.state && address.zipCode
        ? `${address.city}, ${address.state} ${address.zipCode}`
        : null,
      address.country,
      address.phone,
    ].filter(Boolean);

    return parts.join(", ");
  }

  // Get default addresses by type
  static getDefaultAddresses(addresses) {
    const defaults = {};
    addresses.forEach((address) => {
      if (address.isDefault) {
        defaults[address.type] = address;
      }
    });
    return defaults;
  }

  // Check if user has any addresses
  static hasAddresses(addresses) {
    return addresses && addresses.length > 0;
  }

  // Check if user has default address for a specific type
  static hasDefaultAddress(addresses, type) {
    return addresses.some(
      (address) => address.type === type && address.isDefault
    );
  }

  // Get addresses by type
  static getAddressesByType(addresses, type) {
    return addresses.filter((address) => address.type === type);
  }

  // Sort addresses (defaults first, then by type, then by creation date)
  static sortAddresses(addresses) {
    return [...addresses].sort((a, b) => {
      // Default addresses first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;

      // Then by type
      const typeOrder = { home: 1, work: 2, shipping: 3, billing: 4, other: 5 };
      const aOrder = typeOrder[a.type] || 6;
      const bOrder = typeOrder[b.type] || 6;

      if (aOrder !== bOrder) return aOrder - bOrder;

      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }
}

export default UserService;
