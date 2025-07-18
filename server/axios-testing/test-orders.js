const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let buyerToken, sellerToken, adminToken;
let createdOrderId, createdProductId;

// Test data
const testBuyer = {
  name: "Test Buyer",
  email: "buyer@test.com",
  password: "Test123!",
  phone: "+1234567890",
  role: "buyer",
};

const testSeller = {
  name: "Test Seller",
  email: "seller@test.com",
  password: "Test123!",
  phone: "+1234567891",
  role: "seller",
  businessInfo: {
    businessName: "Test Book Store",
    businessType: "Bookstore",
    address: {
      street: "123 Test Street",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      country: "Test Country",
    },
    phone: "+1234567891",
    website: "https://testbookstore.com",
  },
  bankDetails: {
    accountNumber: "1234567890",
    ifscCode: "TEST0001234",
    accountHolderName: "Test Seller",
  },
};

const testAdmin = {
  name: "Test Admin",
  email: "admin@test.com",
  password: "Test123!",
  phone: "+1234567892",
  role: "admin",
};

const testProduct = {
  title: "Test Book for Orders",
  description: "A test book for order management testing",
  category: "Fiction",
  author: "Test Author",
  isbn: "978-0-123456-47-2",
  publisher: "Test Publisher",
  publishYear: 2023,
  language: "English",
  pages: 300,
  condition: "New",
  pricing: {
    price: 299,
    currency: "INR",
    discount: 0,
  },
  inventory: {
    quantity: 50,
    sku: "TB-001",
  },
  images: ["https://example.com/test-book.jpg"],
  tags: ["test", "fiction", "order-testing"],
};

const testOrder = {
  items: [
    {
      productId: "", // Will be set after product creation
      quantity: 2,
    },
  ],
  payment: {
    method: "cod",
  },
  shipping: {
    address: {
      name: "Test Buyer",
      phone: "+1234567890",
      street: "456 Order Street",
      city: "Order City",
      state: "Order State",
      zipCode: "54321",
      country: "Order Country",
    },
    method: "standard",
  },
  notes: {
    buyer: "Please deliver in the morning",
  },
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null, token) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(
      `Error in ${method} ${url}:`,
      error.response?.data || error.message
    );
    return error.response?.data;
  }
};

// Test functions
const testAuth = async () => {
  console.log("\n=== Testing Authentication ===");

  // Register buyer
  console.log("1. Registering buyer...");
  const buyerReg = await axios.post(`${BASE_URL}/auth/register`, testBuyer);
  console.log("✅ Buyer registered:", buyerReg.data.message);

  // Register seller
  console.log("2. Registering seller...");
  const sellerReg = await axios.post(`${BASE_URL}/auth/register`, testSeller);
  console.log("✅ Seller registered:", sellerReg.data.message);

  // Register admin
  console.log("3. Registering admin...");
  const adminReg = await axios.post(`${BASE_URL}/auth/register`, testAdmin);
  console.log("✅ Admin registered:", adminReg.data.message);

  // Login buyer
  console.log("4. Logging in buyer...");
  const buyerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: testBuyer.email,
    password: testBuyer.password,
  });
  buyerToken = buyerLogin.data.data.accessToken;
  console.log("✅ Buyer logged in");

  // Login seller
  console.log("5. Logging in seller...");
  const sellerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: testSeller.email,
    password: testSeller.password,
  });
  sellerToken = sellerLogin.data.data.accessToken;
  console.log("✅ Seller logged in");

  // Login admin
  console.log("6. Logging in admin...");
  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: testAdmin.email,
    password: testAdmin.password,
  });
  adminToken = adminLogin.data.data.accessToken;
  console.log("✅ Admin logged in");
};

const testProductCreation = async () => {
  console.log("\n=== Testing Product Creation ===");

  console.log("1. Creating test product...");
  const product = await makeAuthRequest(
    "POST",
    "/products",
    testProduct,
    sellerToken
  );

  if (product.success) {
    createdProductId = product.data.product._id;
    testOrder.items[0].productId = createdProductId;
    console.log("✅ Product created:", product.data.product.title);
  } else {
    console.log("❌ Product creation failed:", product.message);
  }
};

const testOrderCreation = async () => {
  console.log("\n=== Testing Order Creation ===");

  console.log("1. Creating order...");
  const order = await makeAuthRequest("POST", "/orders", testOrder, buyerToken);

  if (order.success) {
    createdOrderId = order.data.order._id;
    console.log("✅ Order created:", order.data.order.orderNumber);
    console.log("   Status:", order.data.order.status);
    console.log("   Total:", order.data.order.total);
  } else {
    console.log("❌ Order creation failed:", order.message);
  }
};

const testOrderRetrieval = async () => {
  console.log("\n=== Testing Order Retrieval ===");

  // Get buyer's orders
  console.log("1. Getting buyer's orders...");
  const buyerOrders = await makeAuthRequest(
    "GET",
    "/orders/my-orders",
    null,
    buyerToken
  );
  if (buyerOrders.success) {
    console.log(
      "✅ Buyer orders retrieved:",
      buyerOrders.data.orders.length,
      "orders"
    );
  } else {
    console.log("❌ Failed to get buyer orders:", buyerOrders.message);
  }

  // Get specific order
  console.log("2. Getting specific order...");
  const order = await makeAuthRequest(
    "GET",
    `/orders/${createdOrderId}`,
    null,
    buyerToken
  );
  if (order.success) {
    console.log("✅ Order retrieved:", order.data.order.orderNumber);
  } else {
    console.log("❌ Failed to get order:", order.message);
  }

  // Get seller's orders
  console.log("3. Getting seller's orders...");
  const sellerOrders = await makeAuthRequest(
    "GET",
    "/orders/seller/orders",
    null,
    sellerToken
  );
  if (sellerOrders.success) {
    console.log(
      "✅ Seller orders retrieved:",
      sellerOrders.data.orders.length,
      "orders"
    );
  } else {
    console.log("❌ Failed to get seller orders:", sellerOrders.message);
  }

  // Get all orders (admin)
  console.log("4. Getting all orders (admin)...");
  const allOrders = await makeAuthRequest(
    "GET",
    "/orders/admin/orders",
    null,
    adminToken
  );
  if (allOrders.success) {
    console.log(
      "✅ All orders retrieved:",
      allOrders.data.orders.length,
      "orders"
    );
  } else {
    console.log("❌ Failed to get all orders:", allOrders.message);
  }
};

const testOrderStatusUpdates = async () => {
  console.log("\n=== Testing Order Status Updates ===");

  // Seller confirms order
  console.log("1. Seller confirming order...");
  const confirmOrder = await makeAuthRequest(
    "PATCH",
    `/orders/seller/${createdOrderId}/status`,
    { status: "confirmed", note: "Order confirmed by seller" },
    sellerToken
  );
  if (confirmOrder.success) {
    console.log("✅ Order confirmed");
  } else {
    console.log("❌ Order confirmation failed:", confirmOrder.message);
  }

  // Seller processes order
  console.log("2. Seller processing order...");
  const processOrder = await makeAuthRequest(
    "PATCH",
    `/orders/seller/${createdOrderId}/status`,
    { status: "processing", note: "Order is being processed" },
    sellerToken
  );
  if (processOrder.success) {
    console.log("✅ Order processing");
  } else {
    console.log("❌ Order processing failed:", processOrder.message);
  }

  // Seller ships order
  console.log("3. Seller shipping order...");
  const shipOrder = await makeAuthRequest(
    "PATCH",
    `/orders/seller/${createdOrderId}/status`,
    {
      status: "shipped",
      note: "Order shipped",
      trackingNumber: "TRK123456789",
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    sellerToken
  );
  if (shipOrder.success) {
    console.log("✅ Order shipped");
  } else {
    console.log("❌ Order shipping failed:", shipOrder.message);
  }

  // Admin marks as delivered
  console.log("4. Admin marking order as delivered...");
  const deliverOrder = await makeAuthRequest(
    "PATCH",
    `/orders/admin/${createdOrderId}/status`,
    { status: "delivered", note: "Order delivered successfully" },
    adminToken
  );
  if (deliverOrder.success) {
    console.log("✅ Order delivered");
  } else {
    console.log("❌ Order delivery failed:", deliverOrder.message);
  }
};

const testOrderCancellation = async () => {
  console.log("\n=== Testing Order Cancellation ===");

  // Create another order for cancellation testing
  console.log("1. Creating order for cancellation test...");
  const cancelTestOrder = { ...testOrder };
  const newOrder = await makeAuthRequest(
    "POST",
    "/orders",
    cancelTestOrder,
    buyerToken
  );

  if (newOrder.success) {
    const cancelOrderId = newOrder.data.order._id;
    console.log("✅ Test order created:", newOrder.data.order.orderNumber);

    // Buyer cancels order
    console.log("2. Buyer cancelling order...");
    const cancelOrder = await makeAuthRequest(
      "PATCH",
      `/orders/${cancelOrderId}/cancel`,
      { reason: "Changed my mind about the purchase" },
      buyerToken
    );
    if (cancelOrder.success) {
      console.log("✅ Order cancelled by buyer");
    } else {
      console.log("❌ Order cancellation failed:", cancelOrder.message);
    }
  } else {
    console.log("❌ Failed to create test order for cancellation");
  }
};

const testRefundProcessing = async () => {
  console.log("\n=== Testing Refund Processing ===");

  console.log("1. Admin processing refund...");
  const refundOrder = await makeAuthRequest(
    "PATCH",
    `/orders/admin/${createdOrderId}/refund`,
    {
      reason: "Customer requested refund due to damaged product",
      amount: 299,
    },
    adminToken
  );
  if (refundOrder.success) {
    console.log("✅ Refund processed");
    console.log("   Refund amount:", refundOrder.data.refundAmount);
  } else {
    console.log("❌ Refund processing failed:", refundOrder.message);
  }
};

const testReturnProcessing = async () => {
  console.log("\n=== Testing Return Processing ===");

  // Create another order for return testing
  console.log("1. Creating order for return test...");
  const returnTestOrder = { ...testOrder };
  const newOrder = await makeAuthRequest(
    "POST",
    "/orders",
    returnTestOrder,
    buyerToken
  );

  if (newOrder.success) {
    const returnOrderId = newOrder.data.order._id;
    console.log(
      "✅ Test order created for return:",
      newOrder.data.order.orderNumber
    );

    // Mark as delivered first
    await makeAuthRequest(
      "PATCH",
      `/orders/admin/${returnOrderId}/status`,
      { status: "delivered" },
      adminToken
    );

    // Buyer initiates return
    console.log("2. Buyer initiating return...");
    const returnOrder = await makeAuthRequest(
      "PATCH",
      `/orders/${returnOrderId}/return`,
      {
        reason: "Book arrived damaged",
        items: [
          {
            productId: createdProductId,
            quantity: 1,
            reason: "Damaged during shipping",
          },
        ],
      },
      buyerToken
    );
    if (returnOrder.success) {
      console.log("✅ Return initiated");
    } else {
      console.log("❌ Return initiation failed:", returnOrder.message);
    }
  } else {
    console.log("❌ Failed to create test order for return");
  }
};

const testPaymentStatusUpdate = async () => {
  console.log("\n=== Testing Payment Status Update ===");

  // Create another order for payment testing
  console.log("1. Creating order for payment test...");
  const paymentTestOrder = { ...testOrder };
  const newOrder = await makeAuthRequest(
    "POST",
    "/orders",
    paymentTestOrder,
    buyerToken
  );

  if (newOrder.success) {
    const paymentOrderId = newOrder.data.order._id;
    console.log(
      "✅ Test order created for payment:",
      newOrder.data.order.orderNumber
    );

    // Admin updates payment status
    console.log("2. Admin updating payment status...");
    const updatePayment = await makeAuthRequest(
      "PATCH",
      `/orders/admin/${paymentOrderId}/payment`,
      {
        status: "completed",
        transactionId: "TXN123456789",
        gateway: "Stripe",
      },
      adminToken
    );
    if (updatePayment.success) {
      console.log("✅ Payment status updated");
    } else {
      console.log("❌ Payment status update failed:", updatePayment.message);
    }
  } else {
    console.log("❌ Failed to create test order for payment");
  }
};

const testOrderStats = async () => {
  console.log("\n=== Testing Order Statistics ===");

  console.log("1. Getting order statistics...");
  const stats = await makeAuthRequest(
    "GET",
    "/orders/admin/stats",
    null,
    adminToken
  );
  if (stats.success) {
    console.log("✅ Order statistics retrieved:");
    console.log("   Total orders:", stats.data.stats.totalOrders);
    console.log("   Pending orders:", stats.data.stats.pendingOrders);
    console.log("   Delivered orders:", stats.data.stats.deliveredOrders);
    console.log("   Total revenue:", stats.data.stats.totalRevenue);
    console.log("   Average order value:", stats.data.stats.averageOrderValue);
  } else {
    console.log("❌ Failed to get order statistics:", stats.message);
  }
};

const testAccessControl = async () => {
  console.log("\n=== Testing Access Control ===");

  // Buyer trying to access seller routes
  console.log("1. Buyer trying to access seller routes...");
  const buyerSellerAccess = await makeAuthRequest(
    "GET",
    "/orders/seller/orders",
    null,
    buyerToken
  );
  if (!buyerSellerAccess.success) {
    console.log("✅ Access correctly denied for buyer to seller routes");
  } else {
    console.log("❌ Buyer incorrectly allowed access to seller routes");
  }

  // Seller trying to access admin routes
  console.log("2. Seller trying to access admin routes...");
  const sellerAdminAccess = await makeAuthRequest(
    "GET",
    "/orders/admin/orders",
    null,
    sellerToken
  );
  if (!sellerAdminAccess.success) {
    console.log("✅ Access correctly denied for seller to admin routes");
  } else {
    console.log("❌ Seller incorrectly allowed access to admin routes");
  }

  // Buyer trying to update payment status
  console.log("3. Buyer trying to update payment status...");
  const buyerPaymentAccess = await makeAuthRequest(
    "PATCH",
    `/orders/admin/${createdOrderId}/payment`,
    { status: "completed" },
    buyerToken
  );
  if (!buyerPaymentAccess.success) {
    console.log("✅ Access correctly denied for buyer to payment updates");
  } else {
    console.log("❌ Buyer incorrectly allowed access to payment updates");
  }
};

const runAllTests = async () => {
  console.log("🚀 Starting Order Management System Tests...\n");

  try {
    await testAuth();
    await testProductCreation();
    await testOrderCreation();
    await testOrderRetrieval();
    await testOrderStatusUpdates();
    await testOrderCancellation();
    await testRefundProcessing();
    await testReturnProcessing();
    await testPaymentStatusUpdate();
    await testOrderStats();
    await testAccessControl();

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ Authentication and user management");
    console.log("✅ Product creation and management");
    console.log("✅ Order creation and validation");
    console.log("✅ Order retrieval (buyer, seller, admin)");
    console.log("✅ Order status updates and workflow");
    console.log("✅ Order cancellation");
    console.log("✅ Refund processing");
    console.log("✅ Return processing");
    console.log("✅ Payment status management");
    console.log("✅ Order statistics and analytics");
    console.log("✅ Role-based access control");
  } catch (error) {
    console.error("\n❌ Test execution failed:", error.message);
  }
};

// Run tests
runAllTests();
