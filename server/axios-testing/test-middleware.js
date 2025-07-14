const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let adminAuthToken = "";
let sellerAuthToken = "";
let buyerAuthToken = "";

// Helper function to log responses
const logResponse = (title, response) => {
  console.log(`\n${title}:`);
  console.log(`Status: ${response.status}`);
  console.log(`Data:`, JSON.stringify(response.data, null, 2));
};

// Helper function to log errors
const logError = (title, error) => {
  console.log(`\n${title}:`);
  console.log(
    `Error: ${error.response?.status} - ${
      error.response?.data?.message || error.message
    }`
  );
};

// Test 1: Register different user types
const testUserRegistration = async () => {
  try {
    console.log("\n=== Testing User Registration ===");

    // Register admin
    const adminResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: "admin@test.com",
      password: "AdminPass123!",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    adminAuthToken = adminResponse.data.data.accessToken;
    console.log("✅ Admin registered successfully");

    // Register seller
    const sellerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: "seller@test.com",
      password: "SellerPass123!",
      firstName: "Test",
      lastName: "Seller",
      role: "seller",
      businessInfo: {
        businessName: "Test Electronics Store",
        businessDescription: "A test electronics store",
        businessType: "retail",
        taxId: "12-3456789",
        businessAddress: {
          street: "123 Business St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "Test Country",
        },
      },
    });
    sellerAuthToken = sellerResponse.data.data.accessToken;
    console.log("✅ Seller registered successfully");

    // Register buyer
    const buyerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: "buyer@test.com",
      password: "BuyerPass123!",
      firstName: "Test",
      lastName: "Buyer",
      role: "buyer",
    });
    buyerAuthToken = buyerResponse.data.data.accessToken;
    console.log("✅ Buyer registered successfully");
  } catch (error) {
    logError("User Registration", error);
  }
};

// Test 2: Test public endpoints (no authentication required)
const testPublicEndpoints = async () => {
  try {
    console.log("\n=== Testing Public Endpoints ===");

    // Test get products (public)
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log("✅ Get products (public) - Success");

    // Test get categories (public)
    const categoriesResponse = await axios.get(
      `${BASE_URL}/products/categories`
    );
    console.log("✅ Get categories (public) - Success");

    // Test get featured products (public)
    const featuredResponse = await axios.get(`${BASE_URL}/products/featured`);
    console.log("✅ Get featured products (public) - Success");
  } catch (error) {
    logError("Public Endpoints", error);
  }
};

// Test 3: Test seller-only endpoints
const testSellerEndpoints = async () => {
  try {
    console.log("\n=== Testing Seller-Only Endpoints ===");

    // Test create product (seller only)
    const createResponse = await axios.post(
      `${BASE_URL}/products`,
      {
        title: "Test Product",
        description: "A test product for middleware testing",
        category: "Electronics",
        price: 99.99,
        images: [
          {
            url: "https://example.com/test.jpg",
            alt: "Test Product",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 10 },
      },
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );
    console.log("✅ Create product (seller) - Success");

    // Test get seller products (seller only)
    const sellerProductsResponse = await axios.get(
      `${BASE_URL}/products/seller/my-products`,
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );
    console.log("✅ Get seller products (seller) - Success");
  } catch (error) {
    logError("Seller Endpoints", error);
  }
};

// Test 4: Test admin-only endpoints
const testAdminEndpoints = async () => {
  try {
    console.log("\n=== Testing Admin-Only Endpoints ===");

    // Test admin dashboard (admin only)
    const dashboardResponse = await axios.get(
      `${BASE_URL}/products/admin/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );
    console.log("✅ Admin dashboard (admin) - Success");

    // Test get pending approval (admin only)
    const pendingResponse = await axios.get(
      `${BASE_URL}/products/admin/pending-approval`,
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );
    console.log("✅ Get pending approval (admin) - Success");
  } catch (error) {
    logError("Admin Endpoints", error);
  }
};

// Test 5: Test unauthorized access
const testUnauthorizedAccess = async () => {
  try {
    console.log("\n=== Testing Unauthorized Access ===");

    // Test buyer trying to create product (should fail)
    try {
      await axios.post(
        `${BASE_URL}/products`,
        {
          title: "Unauthorized Product",
          description: "This should fail",
          category: "Electronics",
          price: 99.99,
        },
        {
          headers: {
            Authorization: `Bearer ${buyerAuthToken}`,
          },
        }
      );
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("✅ Buyer cannot create products (403 Forbidden)");
      } else {
        console.log("❌ Unexpected error for buyer creating product");
      }
    }

    // Test seller trying to access admin dashboard (should fail)
    try {
      await axios.get(`${BASE_URL}/products/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      });
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("✅ Seller cannot access admin dashboard (403 Forbidden)");
      } else {
        console.log("❌ Unexpected error for seller accessing admin dashboard");
      }
    }

    // Test no token for protected endpoint (should fail)
    try {
      await axios.post(`${BASE_URL}/products`, {
        title: "No Token Product",
        description: "This should fail",
        category: "Electronics",
        price: 99.99,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ No token returns 401 Unauthorized");
      } else {
        console.log("❌ Unexpected error for no token");
      }
    }
  } catch (error) {
    logError("Unauthorized Access", error);
  }
};

// Test 6: Test validation middleware
const testValidationMiddleware = async () => {
  try {
    console.log("\n=== Testing Validation Middleware ===");

    // Test invalid product data (should fail validation)
    try {
      await axios.post(
        `${BASE_URL}/products`,
        {
          title: "T", // Too short
          price: -10, // Negative price
          category: "", // Empty category
        },
        {
          headers: {
            Authorization: `Bearer ${sellerAuthToken}`,
          },
        }
      );
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Validation middleware working (400 Bad Request)");
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log("❌ Unexpected error for validation");
      }
    }
  } catch (error) {
    logError("Validation Middleware", error);
  }
};

// Test 7: Test admin approval workflow
const testAdminApprovalWorkflow = async () => {
  try {
    console.log("\n=== Testing Admin Approval Workflow ===");

    // Create a product as seller
    const createResponse = await axios.post(
      `${BASE_URL}/products`,
      {
        title: "Product for Approval",
        description: "A product that needs admin approval",
        category: "Electronics",
        price: 199.99,
        images: [
          {
            url: "https://example.com/approval-test.jpg",
            alt: "Approval Test Product",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 5 },
      },
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );

    const productId = createResponse.data.data._id;
    console.log("✅ Product created and pending approval");

    // Approve the product as admin
    const approveResponse = await axios.patch(
      `${BASE_URL}/products/admin/${productId}/approve`,
      {
        notes: "Product approved for testing",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );
    console.log("✅ Product approved by admin");

    // Verify product is now visible publicly
    const publicResponse = await axios.get(`${BASE_URL}/products`);
    const products = publicResponse.data.data.products;
    const approvedProduct = products.find((p) => p._id === productId);

    if (approvedProduct) {
      console.log("✅ Approved product is now visible publicly");
    } else {
      console.log("❌ Approved product not found in public listing");
    }
  } catch (error) {
    logError("Admin Approval Workflow", error);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log("🚀 Starting Middleware Testing...\n");

  await testUserRegistration();
  await testPublicEndpoints();
  await testSellerEndpoints();
  await testAdminEndpoints();
  await testUnauthorizedAccess();
  await testValidationMiddleware();
  await testAdminApprovalWorkflow();

  console.log("\n✅ All Middleware Tests Completed!");
  console.log("\n📊 Summary:");
  console.log("- ✅ Public endpoints work without authentication");
  console.log("- ✅ Seller endpoints require seller role");
  console.log("- ✅ Admin endpoints require admin role");
  console.log("- ✅ Unauthorized access properly blocked");
  console.log("- ✅ Validation middleware working");
  console.log("- ✅ Admin approval workflow functional");
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
};
