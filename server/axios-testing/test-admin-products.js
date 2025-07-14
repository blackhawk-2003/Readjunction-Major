const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let adminAuthToken = "";
let sellerAuthToken = "";
let productIds = [];

// Test data
const testProduct1 = {
  title: "Test Product 1 - Pending Approval",
  description: "This is a test product that needs admin approval",
  shortDescription: "A test product for approval",
  category: "Electronics",
  subcategory: "Smartphones",
  brand: "TestBrand",
  price: 299.99,
  comparePrice: 399.99,
  costPrice: 200.0,
  images: [
    {
      url: "https://example.com/image1.jpg",
      alt: "Product Image 1",
      isPrimary: true,
    },
  ],
  inventory: {
    quantity: 50,
    lowStockThreshold: 10,
    trackInventory: true,
    allowBackorder: false,
    maxOrderQuantity: 5,
  },
  specifications: [
    {
      name: "Screen Size",
      value: "6.1 inches",
    },
  ],
  tags: ["smartphone", "electronics", "mobile"],
};

const testProduct2 = {
  title: "Test Product 2 - Another Pending",
  description: "Another test product awaiting approval",
  shortDescription: "Second test product",
  category: "Electronics",
  subcategory: "Laptops",
  brand: "TestBrand",
  price: 899.99,
  comparePrice: 999.99,
  costPrice: 700.0,
  images: [
    {
      url: "https://example.com/image2.jpg",
      alt: "Product Image 2",
      isPrimary: true,
    },
  ],
  inventory: {
    quantity: 25,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    maxOrderQuantity: 3,
  },
  specifications: [
    {
      name: "Processor",
      value: "Intel i7",
    },
  ],
  tags: ["laptop", "electronics", "computer"],
};

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

// Test 1: Register an admin account
const testAdminRegistration = async () => {
  try {
    console.log("\n=== Testing Admin Registration ===");

    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email: "admin@readjunction.com",
      password: "AdminPass123!",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    logResponse("Admin Registration", response);
    adminAuthToken = response.data.data.accessToken;
  } catch (error) {
    logError("Admin Registration", error);
  }
};

// Test 2: Login as admin
const testAdminLogin = async () => {
  try {
    console.log("\n=== Testing Admin Login ===");

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "admin@readjunction.com",
      password: "AdminPass123!",
    });

    logResponse("Admin Login", response);
    adminAuthToken = response.data.data.accessToken;
  } catch (error) {
    logError("Admin Login", error);
  }
};

// Test 3: Register a seller account
const testSellerRegistration = async () => {
  try {
    console.log("\n=== Testing Seller Registration ===");

    const response = await axios.post(`${BASE_URL}/auth/register`, {
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

    logResponse("Seller Registration", response);
    sellerAuthToken = response.data.data.accessToken;
  } catch (error) {
    logError("Seller Registration", error);
  }
};

// Test 4: Login as seller
const testSellerLogin = async () => {
  try {
    console.log("\n=== Testing Seller Login ===");

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "seller@test.com",
      password: "SellerPass123!",
    });

    logResponse("Seller Login", response);
    sellerAuthToken = response.data.data.accessToken;
  } catch (error) {
    logError("Seller Login", error);
  }
};

// Test 5: Create products as seller (will be pending approval)
const testCreateProducts = async () => {
  try {
    console.log("\n=== Testing Product Creation (Pending Approval) ===");

    // Create first product
    const response1 = await axios.post(`${BASE_URL}/products`, testProduct1, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });

    logResponse("Product 1 Creation", response1);
    productIds.push(response1.data.data._id);

    // Create second product
    const response2 = await axios.post(`${BASE_URL}/products`, testProduct2, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });

    logResponse("Product 2 Creation", response2);
    productIds.push(response2.data.data._id);
  } catch (error) {
    logError("Product Creation", error);
  }
};

// Test 6: Get admin dashboard stats
const testAdminDashboard = async () => {
  try {
    console.log("\n=== Testing Admin Dashboard ===");

    const response = await axios.get(`${BASE_URL}/products/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    logResponse("Admin Dashboard", response);
  } catch (error) {
    logError("Admin Dashboard", error);
  }
};

// Test 7: Get products pending approval
const testGetPendingApproval = async () => {
  try {
    console.log("\n=== Testing Get Pending Approval Products ===");

    const response = await axios.get(
      `${BASE_URL}/products/admin/pending-approval`,
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Pending Approval Products", response);
  } catch (error) {
    logError("Get Pending Approval", error);
  }
};

// Test 8: Approve a product
const testApproveProduct = async () => {
  try {
    console.log("\n=== Testing Product Approval ===");

    const response = await axios.patch(
      `${BASE_URL}/products/admin/${productIds[0]}/approve`,
      {
        notes: "Product approved after review. Good quality and pricing.",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Product Approval", response);
  } catch (error) {
    logError("Product Approval", error);
  }
};

// Test 9: Reject a product
const testRejectProduct = async () => {
  try {
    console.log("\n=== Testing Product Rejection ===");

    const response = await axios.patch(
      `${BASE_URL}/products/admin/${productIds[1]}/reject`,
      {
        notes:
          "Product rejected due to incomplete information and poor image quality.",
        reason: "Incomplete product information",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Product Rejection", response);
  } catch (error) {
    logError("Product Rejection", error);
  }
};

// Test 10: Create more products for bulk operations
const testCreateMoreProducts = async () => {
  try {
    console.log("\n=== Testing Create More Products for Bulk Operations ===");

    const additionalProducts = [
      {
        title: "Bulk Test Product 1",
        description: "First product for bulk approval testing",
        category: "Electronics",
        brand: "TestBrand",
        price: 199.99,
        images: [
          {
            url: "https://example.com/bulk1.jpg",
            alt: "Bulk Product 1",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 30 },
      },
      {
        title: "Bulk Test Product 2",
        description: "Second product for bulk approval testing",
        category: "Electronics",
        brand: "TestBrand",
        price: 299.99,
        images: [
          {
            url: "https://example.com/bulk2.jpg",
            alt: "Bulk Product 2",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 20 },
      },
      {
        title: "Bulk Test Product 3",
        description: "Third product for bulk approval testing",
        category: "Electronics",
        brand: "TestBrand",
        price: 399.99,
        images: [
          {
            url: "https://example.com/bulk3.jpg",
            alt: "Bulk Product 3",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 15 },
      },
    ];

    for (let i = 0; i < additionalProducts.length; i++) {
      const response = await axios.post(
        `${BASE_URL}/products`,
        additionalProducts[i],
        {
          headers: {
            Authorization: `Bearer ${sellerAuthToken}`,
          },
        }
      );

      productIds.push(response.data.data._id);
      console.log(
        `Created bulk test product ${i + 1}: ${response.data.data._id}`
      );
    }
  } catch (error) {
    logError("Create More Products", error);
  }
};

// Test 11: Bulk approve products
const testBulkApprove = async () => {
  try {
    console.log("\n=== Testing Bulk Product Approval ===");

    // Get the last 3 products created for bulk approval
    const productsToApprove = productIds.slice(-3);

    const response = await axios.patch(
      `${BASE_URL}/products/admin/bulk-approve`,
      {
        productIds: productsToApprove,
        notes:
          "Bulk approved after quality review. All products meet standards.",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Bulk Product Approval", response);
  } catch (error) {
    logError("Bulk Approval", error);
  }
};

// Test 12: Get all products for admin
const testGetAllProductsForAdmin = async () => {
  try {
    console.log("\n=== Testing Get All Products for Admin ===");

    const response = await axios.get(`${BASE_URL}/products/admin/all`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
      params: {
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });

    logResponse("All Products for Admin", response);
  } catch (error) {
    logError("Get All Products for Admin", error);
  }
};

// Test 13: Filter products by approval status
const testFilterByApprovalStatus = async () => {
  try {
    console.log("\n=== Testing Filter by Approval Status ===");

    const response = await axios.get(`${BASE_URL}/products/admin/all`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
      params: {
        approvalStatus: "approved",
        limit: 10,
      },
    });

    logResponse("Filtered by Approved Status", response);
  } catch (error) {
    logError("Filter by Approval Status", error);
  }
};

// Test 14: Update approval status
const testUpdateApprovalStatus = async () => {
  try {
    console.log("\n=== Testing Update Approval Status ===");

    // First, let's create a new product to test status update
    const newProduct = {
      title: "Status Update Test Product",
      description: "Product for testing approval status updates",
      category: "Electronics",
      brand: "TestBrand",
      price: 150.99,
      images: [
        {
          url: "https://example.com/status-test.jpg",
          alt: "Status Test Product",
          isPrimary: true,
        },
      ],
      inventory: { quantity: 10 },
    };

    const createResponse = await axios.post(
      `${BASE_URL}/products`,
      newProduct,
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );

    const newProductId = createResponse.data.data._id;
    productIds.push(newProductId);

    // Now update its approval status
    const response = await axios.patch(
      `${BASE_URL}/products/admin/${newProductId}/approval-status`,
      {
        approvalStatus: "approved",
        notes: "Status updated to approved via admin interface",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Update Approval Status", response);
  } catch (error) {
    logError("Update Approval Status", error);
  }
};

// Test 15: Test unauthorized access (seller trying to access admin endpoints)
const testUnauthorizedAccess = async () => {
  try {
    console.log("\n=== Testing Unauthorized Access ===");

    // Try to access admin dashboard as seller
    await axios.get(`${BASE_URL}/products/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });
  } catch (error) {
    logResponse("Unauthorized Access (Expected)", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
  }
};

// Test 16: Test invalid approval data
const testInvalidApprovalData = async () => {
  try {
    console.log("\n=== Testing Invalid Approval Data ===");

    // Try to reject without required fields
    await axios.patch(
      `${BASE_URL}/products/admin/${productIds[0]}/reject`,
      {
        notes: "Missing reason field",
        // reason is missing
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );
  } catch (error) {
    logResponse("Invalid Approval Data (Expected)", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
  }
};

// Test 17: Test bulk reject
const testBulkReject = async () => {
  try {
    console.log("\n=== Testing Bulk Product Rejection ===");

    // Create a few more products for bulk rejection
    const rejectProducts = [
      {
        title: "Bulk Reject Product 1",
        description: "Product for bulk rejection testing",
        category: "Electronics",
        brand: "TestBrand",
        price: 99.99,
        images: [
          {
            url: "https://example.com/reject1.jpg",
            alt: "Reject Product 1",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 5 },
      },
      {
        title: "Bulk Reject Product 2",
        description: "Another product for bulk rejection",
        category: "Electronics",
        brand: "TestBrand",
        price: 149.99,
        images: [
          {
            url: "https://example.com/reject2.jpg",
            alt: "Reject Product 2",
            isPrimary: true,
          },
        ],
        inventory: { quantity: 8 },
      },
    ];

    const newProductIds = [];
    for (const product of rejectProducts) {
      const response = await axios.post(`${BASE_URL}/products`, product, {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      });
      newProductIds.push(response.data.data._id);
      productIds.push(response.data.data._id);
    }

    // Now bulk reject them
    const response = await axios.patch(
      `${BASE_URL}/products/admin/bulk-reject`,
      {
        productIds: newProductIds,
        notes:
          "Bulk rejected due to poor product quality and incomplete information.",
        reason: "Poor product quality",
      },
      {
        headers: {
          Authorization: `Bearer ${adminAuthToken}`,
        },
      }
    );

    logResponse("Bulk Product Rejection", response);
  } catch (error) {
    logError("Bulk Reject", error);
  }
};

// Test 18: Final dashboard check
const testFinalDashboard = async () => {
  try {
    console.log("\n=== Testing Final Dashboard Check ===");

    const response = await axios.get(`${BASE_URL}/products/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    logResponse("Final Dashboard Stats", response);
  } catch (error) {
    logError("Final Dashboard", error);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log("🚀 Starting Admin Product Management System Tests...\n");

  await testAdminRegistration();
  await testAdminLogin();
  await testSellerRegistration();
  await testSellerLogin();
  await testCreateProducts();
  await testAdminDashboard();
  await testGetPendingApproval();
  await testApproveProduct();
  await testRejectProduct();
  await testCreateMoreProducts();
  await testBulkApprove();
  await testGetAllProductsForAdmin();
  await testFilterByApprovalStatus();
  await testUpdateApprovalStatus();
  await testUnauthorizedAccess();
  await testInvalidApprovalData();
  await testBulkReject();
  await testFinalDashboard();

  console.log("\n✅ All Admin Product Management Tests Completed!");
  console.log(`\n📊 Summary:`);
  console.log(`- Total products created: ${productIds.length}`);
  console.log(`- Products approved: ${productIds.length - 2}`); // Assuming 2 were rejected
  console.log(`- Products rejected: 2`);
  console.log(`- Admin dashboard tested`);
  console.log(`- Bulk operations tested`);
  console.log(`- Authorization tested`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testProduct1,
  testProduct2,
};
