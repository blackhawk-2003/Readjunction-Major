require("dotenv").config();
const Razorpay = require("razorpay");

console.log("🔍 Testing Razorpay Configuration...\n");

// Check environment variables
console.log("Environment Variables:");
console.log(
  "RAZORPAY_KEY_ID:",
  process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "RAZORPAY_KEY_SECRET:",
  process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing"
);
console.log("");

// Test Razorpay initialization
try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay client initialized successfully");

  // Test API connection by fetching account details
  razorpay.accounts
    .fetch()
    .then((account) => {
      console.log("✅ Razorpay API connection successful");
      console.log("Account Name:", account.name);
      console.log("Account Email:", account.email);
      console.log("Account Type:", account.type);
    })
    .catch((error) => {
      console.log("❌ Razorpay API connection failed:", error.message);
      if (error.statusCode === 401) {
        console.log(
          "💡 This usually means invalid API keys. Please check your Key ID and Secret."
        );
      }
    });
} catch (error) {
  console.log("❌ Razorpay initialization failed:", error.message);
}

console.log("\n📝 Next Steps:");
console.log("1. If you see ❌ Missing, add your API keys to .env file");
console.log(
  "2. If you see ❌ API connection failed, check your keys are correct"
);
console.log("3. If everything shows ✅, your setup is ready!");
