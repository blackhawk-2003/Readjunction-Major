const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let authToken = "";
let sellerAuthToken = "";
let productId = "";

// Test data
const testProduct = {
  title: "Test Product",
  description: "This is a test product description for testing purposes",
  shortDescription: "A test product",
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
    {
      url: "https://example.com/image2.jpg",
      alt: "Product Image 2",
    },
  ],
  inventory: {
    quantity: 50,
    lowStockThreshold: 10,
    trackInventory: true,
    allowBackorder: false,
    maxOrderQuantity: 5,
  },
  variants: [
    {
      name: "Color",
      options: ["Black", "White", "Blue"],
      priceModifier: 0,
    },
    {
      name: "Storage",
      options: ["64GB", "128GB", "256GB"],
      priceModifier: 50,
    },
  ],
  specifications: [
    {
      name: "Screen Size",
      value: "6.1 inches",
    },
    {
      name: "Battery",
      value: "4000mAh",
    },
  ],
  tags: ["smartphone", "electronics", "mobile"],
  seo: {
    metaTitle: "Test Product - Best Smartphone",
    metaDescription: "Buy the best test smartphone with amazing features",
    slug: "test-product-smartphone",
  },
  shipping: {
    weight: 180,
    dimensions: {
      length: 15,
      width: 7.5,
      height: 0.8,
    },
    freeShipping: true,
    shippingClass: "standard",
  },
};

const updateProductData = {
  title: "Updated Test Product",
  price: 349.99,
  inventory: {
    quantity: 75,
    lowStockThreshold: 15,
  },
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
  if (error.response) {
    console.log(`Status: ${error.response.status}`);
    console.log(`Data:`, JSON.stringify(error.response.data, null, 2));
  } else {
    console.log(`Error:`, error.message);
  }
};

// // Test 1: Register a seller account
// const testSellerRegistration = async () => {
//   try {
//     console.log("\n=== Testing Seller Registration ===");

//     const response = await axios.post(`${BASE_URL}/auth/register`, {
//       email: "seller@test.com",
//       password: "TestPassword123!",
//       firstName: "Test",
//       lastName: "Seller",
//       role: "seller",
//       businessInfo: {
//         businessName: "Test Electronics Store",
//         businessDescription: "A test electronics store",
//         businessType: "retail",
//         taxId: "12-3456789",
//         businessAddress: {
//           street: "123 Business St",
//           city: "Test City",
//           state: "TS",
//           zipCode: "12345",
//           country: "Test Country",
//         },
//         bankDetails: {
//           accountNumber: "1234567890",
//           routingNumber: "987654321",
//           accountHolderName: "Test Electronics Store",
//           bankName: "Test Bank",
//         },
//       },
//     });

//     logResponse("Seller Registration", response);
//     sellerAuthToken = response.data.data.accessToken;
//     console.log("Token after registration:", sellerAuthToken);
//   } catch (error) {
//     logError("Seller Registration", error);
//   }
// };

// Test 2: Login as seller
const testSellerLogin = async () => {
  try {
    console.log("\n=== Testing Seller Login ===");

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "seller@test.com",
      password: "TestPassword123!",
    });

    logResponse("Seller Login", response);
    sellerAuthToken = response.data.data.token;
    console.log("Token after login:", sellerAuthToken);
  } catch (error) {
    logError("Seller Login", error);
  }
};

// Test 3: Create a product
const testCreateProduct = async () => {
  try {
    if (!sellerAuthToken) {
      console.log("Skipping Product Creation: No token set");
      return;
    }
    console.log("\n=== Testing Product Creation ===");
    console.log("Using token:", sellerAuthToken);

    const response = await axios.post(`${BASE_URL}/products`, testProduct, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });

    logResponse("Product Creation", response);
    productId = response.data.data._id;
    console.log("Product ID after creation:", productId);
  } catch (error) {
    logError("Product Creation", error);
  }
};

// Test 4: Get all products (public)
const testGetProducts = async () => {
  try {
    console.log("\n=== Testing Get All Products ===");

    const response = await axios.get(`${BASE_URL}/products`);

    logResponse("Get All Products", response);
  } catch (error) {
    logError("Get All Products", error);
  }
};

// Test 5: Get products with filters
const testGetProductsWithFilters = async () => {
  try {
    console.log("\n=== Testing Get Products with Filters ===");

    const response = await axios.get(`${BASE_URL}/products`, {
      params: {
        category: "Electronics",
        minPrice: 200,
        maxPrice: 500,
        sortBy: "price",
        sortOrder: "asc",
        limit: 5,
      },
    });

    logResponse("Get Products with Filters", response);
  } catch (error) {
    logError("Get Products with Filters", error);
  }
};

// Test 6: Get product by ID
const testGetProductById = async () => {
  try {
    console.log("\n=== Testing Get Product by ID ===");

    const response = await axios.get(`${BASE_URL}/products/${productId}`);

    logResponse("Get Product by ID", response);
  } catch (error) {
    logError("Get Product by ID", error);
  }
};

// Test 7: Get seller's products
const testGetSellerProducts = async () => {
  try {
    if (!sellerAuthToken) {
      console.log("Skipping Get Seller Products: No token set");
      return;
    }
    console.log("\n=== Testing Get Seller Products ===");
    console.log("Using token:", sellerAuthToken);

    const response = await axios.get(
      `${BASE_URL}/products/seller/my-products`,
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );

    logResponse("Get Seller Products", response);
  } catch (error) {
    logError("Get Seller Products", error);
  }
};

// Test 8: Update product
const testUpdateProduct = async () => {
  try {
    if (!sellerAuthToken) {
      console.log("Skipping Product Update: No token set");
      return;
    }
    if (!productId) {
      console.log("Skipping Product Update: No productId set");
      return;
    }
    console.log("\n=== Testing Product Update ===");
    console.log("Using token:", sellerAuthToken);

    const response = await axios.put(
      `${BASE_URL}/products/${productId}`,
      updateProductData,
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );

    logResponse("Product Update", response);
  } catch (error) {
    logError("Product Update", error);
  }
};

// Test 9: Update inventory
const testUpdateInventory = async () => {
  try {
    if (!sellerAuthToken) {
      console.log("Skipping Inventory Update: No token set");
      return;
    }
    if (!productId) {
      console.log("Skipping Inventory Update: No productId set");
      return;
    }
    console.log("\n=== Testing Inventory Update ===");
    console.log("Using token:", sellerAuthToken);

    const response = await axios.patch(
      `${BASE_URL}/products/${productId}/inventory`,
      {
        quantity: 100,
        operation: "set",
      },
      {
        headers: {
          Authorization: `Bearer ${sellerAuthToken}`,
        },
      }
    );

    logResponse("Inventory Update", response);
  } catch (error) {
    logError("Inventory Update", error);
  }
};

// Test 10: Get categories
const testGetCategories = async () => {
  try {
    console.log("\n=== Testing Get Categories ===");

    const response = await axios.get(`${BASE_URL}/products/categories`);

    logResponse("Get Categories", response);
  } catch (error) {
    logError("Get Categories", error);
  }
};

// Test 11: Get featured products
const testGetFeaturedProducts = async () => {
  try {
    console.log("\n=== Testing Get Featured Products ===");

    const response = await axios.get(`${BASE_URL}/products/featured`);

    logResponse("Get Featured Products", response);
  } catch (error) {
    logError("Get Featured Products", error);
  }
};

// Test 12: Get related products
const testGetRelatedProducts = async () => {
  try {
    if (!productId) {
      console.log("Skipping Get Related Products: No productId set");
      return;
    }
    console.log("\n=== Testing Get Related Products ===");

    const response = await axios.get(
      `${BASE_URL}/products/${productId}/related`
    );

    logResponse("Get Related Products", response);
  } catch (error) {
    logError("Get Related Products", error);
  }
};

// Test 13: Search products
const testSearchProducts = async () => {
  try {
    console.log("\n=== Testing Product Search ===");

    const response = await axios.get(`${BASE_URL}/products`, {
      params: {
        search: "test",
        limit: 10,
      },
    });

    logResponse("Product Search", response);
  } catch (error) {
    logError("Product Search", error);
  }
};

// Test 14: Test unauthorized access
const testUnauthorizedAccess = async () => {
  try {
    console.log("\n=== Testing Unauthorized Access ===");

    // Try to create product without token
    await axios.post(`${BASE_URL}/products`, testProduct);
  } catch (error) {
    logResponse("Unauthorized Access (Expected)", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
  }
};

// Test 15: Test invalid product data
const testInvalidProductData = async () => {
  try {
    console.log("\n=== Testing Invalid Product Data ===");

    const invalidProduct = {
      title: "T", // Too short
      price: -10, // Negative price
      category: "", // Empty category
    };

    await axios.post(`${BASE_URL}/products`, invalidProduct, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });
  } catch (error) {
    logResponse("Invalid Product Data (Expected)", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
  }
};

// Test 16: Test product deletion (soft delete)
const testDeleteProduct = async () => {
  try {
    console.log("\n=== Testing Product Deletion ===");

    const response = await axios.delete(`${BASE_URL}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${sellerAuthToken}`,
      },
    });

    logResponse("Product Deletion", response);
  } catch (error) {
    logError("Product Deletion", error);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log("🚀 Starting Product Management System Tests...\n");

  // await testSellerRegistration();
  await testSellerLogin();
  await testCreateProduct();
  await testGetProducts();
  await testGetProductsWithFilters();
  await testGetProductById();
  await testGetSellerProducts();
  await testUpdateProduct();
  await testUpdateInventory();
  await testGetCategories();
  await testGetFeaturedProducts();
  await testGetRelatedProducts();
  await testSearchProducts();
  await testUnauthorizedAccess();
  await testInvalidProductData();
  await testDeleteProduct();

  console.log("\n✅ All Product Management Tests Completed!");
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testProduct,
  updateProductData,
};
