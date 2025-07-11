/**
 * Test Script for Address Management
 *
 * This script demonstrates the address management functionality:
 * - User registration (addresses start empty)
 * - Adding multiple addresses
 * - Updating addresses
 * - Setting default addresses
 * - Deleting addresses
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";
let authToken = "";
let userId = "";
let addressIds = [];

// Test data
const testUser = {
  email: "testuser@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
};

const testAddresses = [
  {
    type: "home",
    isDefault: true,
    firstName: "John",
    lastName: "Doe",
    company: "",
    street: "123 Main Street",
    apartment: "Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1234567890",
    instructions: "Leave at front desk",
  },
  {
    type: "work",
    isDefault: false,
    firstName: "John",
    lastName: "Doe",
    company: "Tech Corp",
    street: "456 Business Ave",
    apartment: "Suite 200",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    country: "United States",
    phone: "+1234567891",
    instructions: "Reception will sign",
  },
  {
    type: "shipping",
    isDefault: false,
    firstName: "John",
    lastName: "Doe",
    company: "",
    street: "789 Shipping Lane",
    apartment: "",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "United States",
    phone: "+1234567892",
    instructions: "Ring doorbell twice",
  },
];

async function testAddressManagement() {
  console.log("🚀 Starting Address Management Tests\n");

  try {
    // Step 1: Register user
    // console.log("1. Registering user...");
    // const registerResponse = await axios.post(
    //   `${BASE_URL}/auth/register`,
    //   testUser
    // );
    // console.log("✅ User registered successfully");
    // console.log(`   User ID: ${registerResponse.data.data.user._id}\n`);

    // Step 2: Login to get auth token
    console.log("2. Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    authToken = loginResponse.data.data.token;
    console.log("✅ Login successful\n");

    // Set auth header for subsequent requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

    // Step 3: Check initial addresses (should be empty)
    console.log("3. Checking initial addresses...");
    const initialAddressesResponse = await axios.get(
      `${BASE_URL}/users/addresses`
    );
    console.log(
      `✅ Initial addresses count: ${initialAddressesResponse.data.data.count}`
    );
    console.log(
      `   Addresses: ${JSON.stringify(
        initialAddressesResponse.data.data.addresses,
        null,
        2
      )}\n`
    );

    // Step 4: Add first address (home)
    console.log("4. Adding home address...");
    const homeAddressResponse = await axios.post(
      `${BASE_URL}/users/addresses`,
      testAddresses[0]
    );
    addressIds.push(homeAddressResponse.data.data.address._id);
    console.log("✅ Home address added successfully");
    console.log(`   Address ID: ${homeAddressResponse.data.data.address._id}`);
    console.log(
      `   Is Default: ${homeAddressResponse.data.data.address.isDefault}\n`
    );

    // Step 5: Add work address
    console.log("5. Adding work address...");
    const workAddressResponse = await axios.post(
      `${BASE_URL}/users/addresses`,
      testAddresses[1]
    );
    addressIds.push(workAddressResponse.data.data.address._id);
    console.log("✅ Work address added successfully");
    console.log(
      `   Address ID: ${workAddressResponse.data.data.address._id}\n`
    );

    // Step 6: Add shipping address
    console.log("6. Adding shipping address...");
    const shippingAddressResponse = await axios.post(
      `${BASE_URL}/users/addresses`,
      testAddresses[2]
    );
    addressIds.push(shippingAddressResponse.data.data.address._id);
    console.log("✅ Shipping address added successfully");
    console.log(
      `   Address ID: ${shippingAddressResponse.data.data.address._id}\n`
    );

    // Step 7: Get all addresses
    console.log("7. Getting all addresses...");
    const allAddressesResponse = await axios.get(`${BASE_URL}/users/addresses`);
    console.log(`✅ Total addresses: ${allAddressesResponse.data.data.count}`);
    console.log("   Addresses:");
    allAddressesResponse.data.data.addresses.forEach((addr, index) => {
      console.log(
        `   ${index + 1}. ${addr.type} - ${addr.street}, ${
          addr.city
        } (Default: ${addr.isDefault})`
      );
    });
    console.log();

    // Step 8: Update work address
    console.log("8. Updating work address...");
    const updateData = {
      company: "Updated Tech Corp",
      street: "999 Updated Business Ave",
      phone: "+1987654321",
    };
    const updateResponse = await axios.put(
      `${BASE_URL}/users/addresses/${addressIds[1]}`,
      updateData
    );
    console.log("✅ Work address updated successfully");
    console.log(`   New company: ${updateResponse.data.data.address.company}`);
    console.log(`   New street: ${updateResponse.data.data.address.street}\n`);

    // Step 9: Set shipping address as default
    console.log("9. Setting shipping address as default...");
    const setDefaultResponse = await axios.put(
      `${BASE_URL}/users/addresses/${addressIds[2]}/default`
    );
    console.log("✅ Shipping address set as default");
    console.log(`   Address: ${setDefaultResponse.data.data.address.street}`);
    console.log(
      `   Is Default: ${setDefaultResponse.data.data.address.isDefault}\n`
    );

    // Step 10: Verify default addresses
    console.log("10. Verifying default addresses...");
    const verifyAddressesResponse = await axios.get(
      `${BASE_URL}/users/addresses`
    );
    const defaultAddresses = verifyAddressesResponse.data.data.addresses.filter(
      (addr) => addr.isDefault
    );
    console.log(`✅ Default addresses found: ${defaultAddresses.length}`);
    defaultAddresses.forEach((addr) => {
      console.log(`   - ${addr.type}: ${addr.street}, ${addr.city}`);
    });
    console.log();

    // Step 11: Delete work address
    console.log("11. Deleting work address...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/users/addresses/${addressIds[1]}`
    );
    console.log("✅ Work address deleted successfully");
    console.log(`   Deleted: ${deleteResponse.data.data.address.street}\n`);

    // Step 12: Final address count
    console.log("12. Final address count...");
    const finalAddressesResponse = await axios.get(
      `${BASE_URL}/users/addresses`
    );
    console.log(
      `✅ Final addresses count: ${finalAddressesResponse.data.data.count}`
    );
    console.log("   Remaining addresses:");
    finalAddressesResponse.data.data.addresses.forEach((addr, index) => {
      console.log(
        `   ${index + 1}. ${addr.type} - ${addr.street}, ${
          addr.city
        } (Default: ${addr.isDefault})`
      );
    });
    console.log();

    console.log("🎉 All address management tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the tests
testAddressManagement();
