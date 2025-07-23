import { create } from "zustand";

const API_BASE = "http://localhost:5000/api/v1/cart";

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Cart fetch error:", data);
        throw new Error(data.message || data.error || "Failed to fetch cart");
      }

      console.log("Cart data received:", data);
      set({ cart: data.data.cart, loading: false });
    } catch (err) {
      console.error("Cart fetch error:", err);
      set({ error: err.message, loading: false });
      setTimeout(() => set({ error: null }), 3500);
    }
  },

  addToCart: async ({ productId, quantity = 1, notes }) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      set({ cart: data.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      setTimeout(() => set({ error: null }), 3500);
    }
  },

  updateCartItem: async (productId, { quantity, notes }) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/items/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity, notes }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update cart item");
      set({ cart: data.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      setTimeout(() => set({ error: null }), 3500);
    }
  },

  removeFromCart: async (productId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/items/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to remove from cart");
      set({ cart: data.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      setTimeout(() => set({ error: null }), 3500);
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to clear cart");
      set({ cart: data.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      setTimeout(() => set({ error: null }), 3500);
    }
  },

  // Clear cart state immediately (for after successful payment)
  clearCartState: () => {
    set({
      cart: {
        items: [],
        totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
      },
    });
  },

  // Helper: get total item count
  getTotalCount: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
