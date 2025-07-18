import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

console.log("🔍 Debugging Razorpay Connection...\n");

// Check environment variables
console.log("Environment Variables:");
console.log(
  "RAZORPAY_KEY_ID:",
  process.env.RAZORPAY_KEY_ID ? "Set" : "Missing"
);
console.log(
  "RAZORPAY_KEY_SECRET:",
  process.env.RAZORPAY_KEY_SECRET ? "Set" : "Missing"
);
console.log("");

// Test Razorpay initialization
try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay client initialized successfully");

  // Test with a simple order creation
  console.log("\n🧪 Testing order creation...");

  const testOrder = await razorpay.orders.create({
    amount: 100, // 1 rupee in paise
    currency: "INR",
    receipt: "test_receipt_" + Date.now(),
    notes: {
      test: "true",
    },
  });

  console.log("✅ Test order created successfully:", testOrder.id);
} catch (error) {
  console.log("❌ Error:", error.message);
  console.log("❌ Error details:", error);

  if (error.statusCode) {
    console.log("❌ Status Code:", error.statusCode);
  }

  if (error.error) {
    console.log("❌ Razorpay Error:", error.error);
  }
}

console.log("\n📝 Debug complete!");
