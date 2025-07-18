const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:5000/api/v1";
let authToken = "";
let buyerToken = "";
let sellerToken = "";
let adminToken = "";
let testOrderId = "";
let paymentIntentId = "";

// Helper function to make authenticated requests
const makeAuthRequest = async (
  method,
  endpoint,
  data = null,
  token = authToken
) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Helper function to log results
const log = (message, data = null) => {
  console.log(`\n${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Test authentication
const testAuth = async () => {
  log("=== Testing Authentication ===");

  // Register buyer
  log("1. Registering buyer...");
  const buyerData = {
    email: "buyer@test.com",
    password: "password123",
    profile: {
      firstName: "John",
      lastName: "Buyer",
    },
    role: "buyer",
  };

  const buyerReg = await axios.post(`${BASE_URL}/auth/register`, buyerData);
  if (buyerReg.data.success) {
    log("✅ Buyer registered successfully");
  } else {
    log("❌ Buyer registration failed:", buyerReg.data.message);
  }

  // Register seller
  log("2. Registering seller...");
  const sellerData = {
    email: "seller@test.com",
    password: "password123",
    profile: {
      firstName: "Jane",
      lastName: "Seller",
    },
    role: "seller",
    businessInfo: {
      businessName: "Test Bookstore",
      businessType: "retail",
      gstin: "22AAAAA0000A1Z5",
      pan: "ABCDE1234F",
    },
  };

  const sellerReg = await axios.post(`${BASE_URL}/auth/register`, sellerData);
  if (sellerReg.data.success) {
    log("✅ Seller registered successfully");
  } else {
    log("❌ Seller registration failed:", sellerReg.data.message);
  }

  // Register admin
  log("3. Registering admin...");
  const adminData = {
    email: "admin@test.com",
    password: "password123",
    profile: {
      firstName: "Admin",
      lastName: "User",
    },
    role: "admin",
  };

  const adminReg = await axios.post(`${BASE_URL}/auth/register`, adminData);
  if (adminReg.data.success) {
    log("✅ Admin registered successfully");
  } else {
    log("❌ Admin registration failed:", adminReg.data.message);
  }

  // Login buyer
  log("4. Logging in buyer...");
  const buyerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: "buyer@test.com",
    password: "password123",
  });

  if (buyerLogin.data.success) {
    buyerToken = buyerLogin.data.data.token;
    log("✅ Buyer logged in successfully");
  } else {
    log("❌ Buyer login failed:", buyerLogin.data.message);
  }

  // Login seller
  log("5. Logging in seller...");
  const sellerLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: "seller@test.com",
    password: "password123",
  });

  if (sellerLogin.data.success) {
    sellerToken = sellerLogin.data.data.token;
    log("✅ Seller logged in successfully");
  } else {
    log("❌ Seller login failed:", sellerLogin.data.message);
  }

  // Login admin
  log("6. Logging in admin...");
  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: "admin@test.com",
    password: "password123",
  });

  if (adminLogin.data.success) {
    adminToken = adminLogin.data.data.token;
    log("✅ Admin logged in successfully");
  } else {
    log("❌ Admin login failed:", adminLogin.data.message);
  }
};

// Test product creation
const testProductCreation = async () => {
  log("=== Testing Product Creation ===");

  log("1. Creating test product...");
  const productData = {
    title: "Test Book for Payment",
    description: "A test book for payment processing",
    price: 299,
    comparePrice: 399,
    costPrice: 200,
    category: "fiction",
    subcategory: "novel",
    brand: "Test Publisher",
    tags: ["test", "payment"],
    specifications: {
      pages: 300,
      language: "English",
      format: "Paperback",
    },
    inventory: {
      quantity: 50,
      lowStockThreshold: 5,
      maxOrderQuantity: 10,
      allowBackorder: false,
    },
    shipping: {
      weight: 0.5,
      dimensions: {
        length: 20,
        width: 15,
        height: 2,
      },
      freeShipping: false,
    },
    images: ["https://example.com/test-book.jpg"],
  };

  const product = await makeAuthRequest(
    "POST",
    "/products",
    productData,
    sellerToken
  );
  if (product.success) {
    log("✅ Product created successfully");
    return product.data.product._id;
  } else {
    log("❌ Product creation failed:", product.message);
    return null;
  }
};

// Test order creation
const testOrderCreation = async (productId) => {
  log("=== Testing Order Creation ===");

  if (!productId) {
    log("❌ No product ID available for order creation");
    return null;
  }

  log("1. Creating test order...");
  const orderData = {
    items: [
      {
        productId: productId,
        quantity: 2,
      },
    ],
    payment: {
      method: "online",
    },
    shipping: {
      address: {
        name: "John Buyer",
        phone: "+1234567890",
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "India",
      },
      method: "standard",
    },
    notes: {
      buyer: "Test order for payment processing",
    },
  };

  const order = await makeAuthRequest("POST", "/orders", orderData, buyerToken);
  if (order.success) {
    log("✅ Order created successfully");
    return order.data.order._id;
  } else {
    log("❌ Order creation failed:", order.message);
    return null;
  }
};

// Test payment intent creation
const testPaymentIntentCreation = async (orderId) => {
  log("=== Testing Payment Intent Creation ===");

  if (!orderId) {
    log("❌ No order ID available for payment intent creation");
    return null;
  }

  log("1. Creating payment intent...");
  const paymentIntentData = {
    orderId: orderId,
  };

  const paymentIntent = await makeAuthRequest(
    "POST",
    "/payments/create-intent",
    paymentIntentData,
    buyerToken
  );
  if (paymentIntent.success) {
    log("✅ Payment intent created successfully");
    log("Payment Intent Details:", paymentIntent.data);
    return paymentIntent.data.clientSecret;
  } else {
    log("❌ Payment intent creation failed:", paymentIntent.message);
    return null;
  }
};

// Test payment confirmation
const testPaymentConfirmation = async (orderId, clientSecret) => {
  log("=== Testing Payment Confirmation ===");

  if (!orderId || !clientSecret) {
    log("❌ Missing order ID or client secret for payment confirmation");
    return;
  }

  log("1. Confirming payment...");
  const confirmData = {
    orderId: orderId,
    paymentIntentId: clientSecret.split("_secret_")[0], // Extract payment intent ID from client secret
  };

  const confirmation = await makeAuthRequest(
    "POST",
    "/payments/confirm",
    confirmData,
    buyerToken
  );
  if (confirmation.success) {
    log("✅ Payment confirmed successfully");
    log("Confirmation Details:", confirmation.data);
  } else {
    log("❌ Payment confirmation failed:", confirmation.message);
  }
};

// Test payment details retrieval
const testPaymentDetails = async (orderId) => {
  log("=== Testing Payment Details Retrieval ===");

  if (!orderId) {
    log("❌ No order ID available for payment details");
    return;
  }

  log("1. Getting payment details...");
  const paymentDetails = await makeAuthRequest(
    "GET",
    `/payments/${orderId}`,
    null,
    buyerToken
  );
  if (paymentDetails.success) {
    log("✅ Payment details retrieved successfully");
    log("Payment Details:", paymentDetails.data);
  } else {
    log("❌ Payment details retrieval failed:", paymentDetails.message);
  }
};

// Test payment methods
const testPaymentMethods = async () => {
  log("=== Testing Payment Methods ===");

  log("1. Getting payment methods...");
  const paymentMethods = await makeAuthRequest(
    "GET",
    "/payments/methods",
    null,
    buyerToken
  );
  if (paymentMethods.success) {
    log("✅ Payment methods retrieved successfully");
    log("Payment Methods:", paymentMethods.data);
  } else {
    log("❌ Payment methods retrieval failed:", paymentMethods.message);
  }

  log("2. Saving payment method...");
  const saveMethodData = {
    paymentMethodId: "pm_test_1234567890", // This would be a real payment method ID from Stripe
  };

  const saveMethod = await makeAuthRequest(
    "POST",
    "/payments/methods",
    saveMethodData,
    buyerToken
  );
  if (saveMethod.success) {
    log("✅ Payment method saved successfully");
  } else {
    log("❌ Payment method save failed:", paymentMethods.message);
  }
};

// Test refund processing
const testRefundProcessing = async (orderId) => {
  log("=== Testing Refund Processing ===");

  if (!orderId) {
    log("❌ No order ID available for refund processing");
    return;
  }

  log("1. Processing refund (seller)...");
  const refundData = {
    orderId: orderId,
    amount: 299,
    reason: "Customer request",
  };

  const refund = await makeAuthRequest(
    "POST",
    "/payments/refund",
    refundData,
    sellerToken
  );
  if (refund.success) {
    log("✅ Refund processed successfully");
    log("Refund Details:", refund.data);
  } else {
    log("❌ Refund processing failed:", refund.message);
  }
};

// Test access control
const testAccessControl = async (orderId) => {
  log("=== Testing Access Control ===");

  if (!orderId) {
    log("❌ No order ID available for access control testing");
    return;
  }

  log("1. Buyer accessing seller payment details...");
  const buyerAccess = await makeAuthRequest(
    "GET",
    `/payments/${orderId}`,
    null,
    buyerToken
  );
  if (buyerAccess.success) {
    log("✅ Buyer can access their own payment details");
  } else {
    log("❌ Buyer access failed:", buyerAccess.message);
  }

  log("2. Seller accessing buyer payment details...");
  const sellerAccess = await makeAuthRequest(
    "GET",
    `/payments/${orderId}`,
    null,
    sellerToken
  );
  if (sellerAccess.success) {
    log("✅ Seller can access payment details for orders with their products");
  } else {
    log("❌ Seller access failed:", sellerAccess.message);
  }

  log("3. Admin accessing payment details...");
  const adminAccess = await makeAuthRequest(
    "GET",
    `/payments/${orderId}`,
    null,
    adminToken
  );
  if (adminAccess.success) {
    log("✅ Admin can access payment details");
  } else {
    log("❌ Admin access failed:", adminAccess.message);
  }
};

// Main test function
const runPaymentTests = async () => {
  try {
    log("🚀 Starting Payment System Tests...");

    // Test authentication
    await testAuth();

    // Test product creation
    const productId = await testProductCreation();

    // Test order creation
    const orderId = await testOrderCreation(productId);
    testOrderId = orderId;

    // Test payment intent creation
    const clientSecret = await testPaymentIntentCreation(orderId);

    // Test payment confirmation
    await testPaymentConfirmation(orderId, clientSecret);

    // Test payment details retrieval
    await testPaymentDetails(orderId);

    // Test payment methods
    await testPaymentMethods();

    // Test refund processing
    await testRefundProcessing(orderId);

    // Test access control
    await testAccessControl(orderId);

    log("🎉 All payment tests completed!");
  } catch (error) {
    log("❌ Test execution failed:", error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runPaymentTests();
}

module.exports = {
  runPaymentTests,
  testAuth,
  testProductCreation,
  testOrderCreation,
  testPaymentIntentCreation,
  testPaymentConfirmation,
  testPaymentDetails,
  testPaymentMethods,
  testRefundProcessing,
  testAccessControl,
};
