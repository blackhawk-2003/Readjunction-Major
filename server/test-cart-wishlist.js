const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let buyerToken;
let sellerToken;
let adminToken;
let productId;
let wishlistId;

// Test data
const testBuyer = {
  email: "buyer@test.com",
  password: "Test123!",
  firstName: "Test",
  lastName: "Buyer",
  phone: "+1234567890",
  role: "buyer",
};

const testSeller = {
  email: "seller@test.com",
  password: "Test123!",
  firstName: "Test",
  lastName: "Seller",
  phone: "+1234567890",
  role: "seller",
  businessInfo: {
    businessName: "Test Bookstore",
    businessType: "bookstore",
    address: {
      street: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      country: "Test Country",
    },
    phone: "+1234567890",
    website: "https://testbookstore.com",
  },
};

const testProduct = {
  title: "Test Book for Cart",
  description: "A test book for cart and wishlist testing",
  category: "fiction",
  price: 29.99,
  quantity: 100,
  images: ["https://example.com/test-book.jpg"],
  condition: "new",
  language: "English",
  isbn: "978-0-123456-78-9",
  author: "Test Author",
  publisher: "Test Publisher",
  publicationYear: 2023,
  pages: 300,
  format: "hardcover",
  dimensions: {
    length: 8.5,
    width: 5.5,
    height: 1.0,
    weight: 1.2,
  },
};

const testShippingAddress = {
  name: "Test Buyer",
  phone: "+1234567890",
  street: "456 Buyer St",
  city: "Buyer City",
  state: "Buyer State",
  zipCode: "54321",
  country: "Buyer Country",
};

// Utility functions
const log = (message, data = null) => {
  console.log(`\n${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(data && { data }),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(
      `Error in ${method} ${endpoint}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Test functions
const testAuth = async () => {
  log("🔐 Testing Authentication...");

  // Register buyer
  log("Registering buyer...");
  await makeRequest("POST", "/auth/register", testBuyer);

  // Login buyer
  log("Logging in buyer...");
  const buyerResponse = await makeRequest("POST", "/auth/login", {
    email: testBuyer.email,
    password: testBuyer.password,
  });
  buyerToken = buyerResponse.data.token;

  // Register seller
  log("Registering seller...");
  await makeRequest("POST", "/auth/register", testSeller);

  // Login seller
  log("Logging in seller...");
  const sellerResponse = await makeRequest("POST", "/auth/login", {
    email: testSeller.email,
    password: testSeller.password,
  });
  sellerToken = sellerResponse.data.token;

  log("✅ Authentication tests completed");
};

const testProductCreation = async () => {
  log("📚 Testing Product Creation...");

  // Create product
  log("Creating test product...");
  const productResponse = await makeRequest(
    "POST",
    "/products",
    testProduct,
    sellerToken
  );
  productId = productResponse.data.product._id;

  // Approve product as admin (mock)
  log("Approving product...");
  await makeRequest(
    "PUT",
    `/products/${productId}/status`,
    { status: "approved" },
    sellerToken
  );

  log("✅ Product creation tests completed");
};

const testCartOperations = async () => {
  log("🛒 Testing Cart Operations...");

  // Get empty cart
  log("Getting empty cart...");
  let cartResponse = await makeRequest("GET", "/cart", null, buyerToken);
  log("Empty cart retrieved", cartResponse.data.cart);

  // Add item to cart
  log("Adding item to cart...");
  const addToCartData = {
    productId,
    quantity: 2,
    notes: "Test notes for cart item",
  };
  cartResponse = await makeRequest("POST", "/cart", addToCartData, buyerToken);
  log("Item added to cart", cartResponse.data.cart);

  // Get cart summary
  log("Getting cart summary...");
  const summaryResponse = await makeRequest(
    "GET",
    "/cart/summary",
    null,
    buyerToken
  );
  log("Cart summary", summaryResponse.data.summary);

  // Update item quantity
  log("Updating item quantity...");
  await makeRequest(
    "PUT",
    `/cart/items/${productId}`,
    { quantity: 3 },
    buyerToken
  );

  // Update shipping address
  log("Updating shipping address...");
  await makeRequest(
    "PUT",
    "/cart/shipping/address",
    testShippingAddress,
    buyerToken
  );

  // Update shipping method
  log("Updating shipping method...");
  await makeRequest(
    "PUT",
    "/cart/shipping/method",
    { shippingMethod: "express" },
    buyerToken
  );

  // Update payment method
  log("Updating payment method...");
  await makeRequest(
    "PUT",
    "/cart/payment/method",
    { paymentMethod: "online" },
    buyerToken
  );

  // Apply coupon
  log("Applying coupon...");
  await makeRequest("POST", "/cart/coupon", { code: "WELCOME10" }, buyerToken);

  // Get updated cart
  cartResponse = await makeRequest("GET", "/cart", null, buyerToken);
  log("Updated cart with coupon", cartResponse.data.cart);

  // Remove coupon
  log("Removing coupon...");
  await makeRequest("DELETE", "/cart/coupon", null, buyerToken);

  // Update item selection
  log("Updating item selection...");
  await makeRequest(
    "PUT",
    `/cart/items/${productId}/selection`,
    { isSelected: false },
    buyerToken
  );

  // Get cart for checkout
  log("Getting cart for checkout...");
  try {
    const checkoutResponse = await makeRequest(
      "GET",
      "/cart/checkout",
      null,
      buyerToken
    );
    log("Checkout data", checkoutResponse.data.checkoutData);
  } catch (error) {
    log("Expected error - no items selected for checkout");
  }

  // Re-select item
  await makeRequest(
    "PUT",
    `/cart/items/${productId}/selection`,
    { isSelected: true },
    buyerToken
  );

  // Bulk update cart
  log("Bulk updating cart...");
  const bulkUpdateData = {
    items: [{ productId, quantity: 1, isSelected: true }],
  };
  await makeRequest("PUT", "/cart/bulk", bulkUpdateData, buyerToken);

  log("✅ Cart operations tests completed");
};

const testWishlistOperations = async () => {
  log("💝 Testing Wishlist Operations...");

  // Create wishlist
  log("Creating wishlist...");
  const createWishlistData = {
    name: "My Test Wishlist",
    description: "A test wishlist for testing",
    isPublic: false,
  };
  const wishlistResponse = await makeRequest(
    "POST",
    "/wishlists",
    createWishlistData,
    buyerToken
  );
  wishlistId = wishlistResponse.data.wishlist._id;
  log("Wishlist created", wishlistResponse.data.wishlist);

  // Add item to wishlist
  log("Adding item to wishlist...");
  const addToWishlistData = {
    productId,
    notes: "Test notes for wishlist item",
    priority: "high",
  };
  await makeRequest(
    "POST",
    `/wishlists/${wishlistId}/items`,
    addToWishlistData,
    buyerToken
  );

  // Get wishlist
  log("Getting wishlist...");
  const wishlistResponse2 = await makeRequest(
    "GET",
    `/wishlists/${wishlistId}`,
    null,
    buyerToken
  );
  log("Wishlist retrieved", wishlistResponse2.data.wishlist);

  // Update wishlist item
  log("Updating wishlist item...");
  await makeRequest(
    "PUT",
    `/wishlists/${wishlistId}/items/${productId}`,
    {
      notes: "Updated notes",
      priority: "medium",
    },
    buyerToken
  );

  // Get wishlist items with filtering
  log("Getting wishlist items with filtering...");
  const itemsResponse = await makeRequest(
    "GET",
    `/wishlists/${wishlistId}/items?priority=medium&sortBy=addedAt&sortOrder=desc`,
    null,
    buyerToken
  );
  log("Filtered wishlist items", itemsResponse.data);

  // Check for price drops
  log("Checking for price drops...");
  const priceDropsResponse = await makeRequest(
    "GET",
    `/wishlists/${wishlistId}/price-drops`,
    null,
    buyerToken
  );
  log("Price drops check", priceDropsResponse.data);

  // Share wishlist
  log("Sharing wishlist...");
  const shareData = {
    isPublic: true,
    shareWith: ["friend@example.com"],
  };
  await makeRequest(
    "PUT",
    `/wishlists/${wishlistId}/share`,
    shareData,
    buyerToken
  );

  // Copy wishlist
  log("Copying wishlist...");
  const copyData = {
    name: "Copied Wishlist",
    description: "A copy of the test wishlist",
    includeItems: true,
  };
  const copyResponse = await makeRequest(
    "POST",
    `/wishlists/${wishlistId}/copy`,
    copyData,
    buyerToken
  );
  log("Wishlist copied", copyResponse.data.wishlist);

  // Bulk operations
  log("Testing bulk operations...");
  const bulkData = {
    productIds: [productId],
    operation: "updatePriority",
    priority: "low",
  };
  await makeRequest(
    "PUT",
    `/wishlists/${wishlistId}/bulk`,
    bulkData,
    buyerToken
  );

  // Get all wishlists
  log("Getting all wishlists...");
  const allWishlistsResponse = await makeRequest(
    "GET",
    "/wishlists",
    null,
    buyerToken
  );
  log("All wishlists", allWishlistsResponse.data);

  log("✅ Wishlist operations tests completed");
};

const testWishlistCartIntegration = async () => {
  log("🔄 Testing Wishlist-Cart Integration...");

  // Move items from wishlist to cart
  log("Moving items from wishlist to cart...");
  const moveData = {
    productIds: [productId],
    quantities: { [productId]: 2 },
  };
  const moveResponse = await makeRequest(
    "POST",
    `/wishlists/${wishlistId}/move-to-cart`,
    moveData,
    buyerToken
  );
  log("Items moved to cart", moveResponse.data);

  // Get updated cart
  const cartResponse = await makeRequest("GET", "/cart", null, buyerToken);
  log("Cart after moving from wishlist", cartResponse.data.cart);

  // Get updated wishlist
  const wishlistResponse = await makeRequest(
    "GET",
    `/wishlists/${wishlistId}`,
    null,
    buyerToken
  );
  log("Wishlist after moving items", wishlistResponse.data.wishlist);

  log("✅ Wishlist-Cart integration tests completed");
};

const testPublicWishlist = async () => {
  log("🌐 Testing Public Wishlist...");

  // Get public wishlist
  log("Getting public wishlist...");
  const publicResponse = await makeRequest(
    "GET",
    `/wishlists/public/${wishlistId}`
  );
  log("Public wishlist", publicResponse.data.wishlist);

  log("✅ Public wishlist tests completed");
};

const testCleanup = async () => {
  log("🧹 Testing Cleanup Operations...");

  // Clear cart
  log("Clearing cart...");
  await makeRequest("DELETE", "/cart", null, buyerToken);

  // Remove item from wishlist
  log("Removing item from wishlist...");
  await makeRequest(
    "DELETE",
    `/wishlists/${wishlistId}/items/${productId}`,
    null,
    buyerToken
  );

  // Delete wishlist
  log("Deleting wishlist...");
  await makeRequest("DELETE", `/wishlists/${wishlistId}`, null, buyerToken);

  log("✅ Cleanup tests completed");
};

const testErrorHandling = async () => {
  log("❌ Testing Error Handling...");

  // Try to add invalid product to cart
  log("Testing invalid product addition...");
  try {
    await makeRequest(
      "POST",
      "/cart",
      { productId: "invalid-id", quantity: 1 },
      buyerToken
    );
  } catch (error) {
    log("Expected error for invalid product ID");
  }

  // Try to access cart without authentication
  log("Testing unauthorized access...");
  try {
    await makeRequest("GET", "/cart");
  } catch (error) {
    log("Expected error for unauthorized access");
  }

  // Try to add item to non-existent wishlist
  log("Testing non-existent wishlist...");
  try {
    await makeRequest(
      "POST",
      "/wishlists/invalid-id/items",
      { productId },
      buyerToken
    );
  } catch (error) {
    log("Expected error for non-existent wishlist");
  }

  log("✅ Error handling tests completed");
};

// Main test runner
const runTests = async () => {
  try {
    log("🚀 Starting Cart & Wishlist System Tests...");

    await testAuth();
    await testProductCreation();
    await testCartOperations();
    await testWishlistOperations();
    await testWishlistCartIntegration();
    await testPublicWishlist();
    await testErrorHandling();
    await testCleanup();

    log("🎉 All Cart & Wishlist tests completed successfully!");
  } catch (error) {
    log("💥 Test failed:", error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAuth,
  testCartOperations,
  testWishlistOperations,
};
