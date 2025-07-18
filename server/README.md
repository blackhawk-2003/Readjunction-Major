# 📚 ReadJunction Server

A robust, scalable backend for the ReadJunction ecommerce platform, built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Features Implemented So Far

### 🔐 Authentication & User Management

- **User & Seller Registration**
  - Register as a buyer or as a seller (with business info)
- **JWT Authentication**
  - Secure login for users and sellers
  - Refresh token support (HTTP-only cookies)
- **Role-based Access**
  - Buyer, Seller, and Admin roles
- **Password Reset**
  - Request password reset (email token)
  - Reset password with secure token
- **User Profile Management**
  - Get and update user profile
  - Change password
  - Deactivate account
- **Flexible Address Management**
  - Multiple addresses per user (home, work, shipping, billing, other)
  - Set default addresses per type
  - Add, update, delete addresses
  - Address validation and type categorization

### 🛍️ Product Management System (**COMPLETE**)

- **Comprehensive Product CRUD**
  - Create, read, update, delete products (sellers only)
  - Rich product data with variants, specifications, and SEO
- **Advanced Inventory Management**
  - Track inventory levels with low stock alerts
  - Backorder support
  - Maximum order quantity limits
- **Product Discovery & Search**
  - Advanced filtering (category, price, brand, etc.)
  - Full-text search across title, description, and tags
  - Sorting by price, popularity, ratings, etc.
  - Pagination support
- **Product Categories & Organization**
  - Categories and subcategories
  - Brand management
  - Product tags for better discovery
- **SEO & Marketing Features**
  - Meta titles and descriptions
  - Custom slugs
  - Featured products
  - Related products recommendations
- **Product Variants & Specifications**
  - Multiple variants (size, color, etc.)
  - Detailed product specifications
  - Price modifiers for variants
- **Shipping & Pricing**
  - Weight and dimensions tracking
  - Free shipping options
  - Compare prices for discounts
  - Cost price tracking
- **Admin Product Approval & Moderation**
  - Admin can approve/reject products
  - Bulk approval/rejection
  - Admin dashboard and stats

### 📦 Order Management System (**COMPLETE**)

- **Complete Order Lifecycle**
  - Order creation with validation
  - Status tracking (pending → confirmed → processing → shipped → delivered)
  - Order cancellation and refunds
  - Return processing
- **Role-based Order Management**
  - Buyers: Create orders, view their orders, cancel orders, initiate returns
  - Sellers: View orders containing their products, update status, process refunds
  - Admins: Full order management, payment status updates, analytics
- **Advanced Order Features**
  - Automatic order number generation
  - Status history tracking
  - Inventory management integration
  - Shipping and payment tracking
  - Order notes and communication
- **Payment Management**
  - Multiple payment methods (COD, online, card, UPI, wallet)
  - Payment status tracking
  - Refund processing
- **Shipping Management**
  - Multiple shipping methods (standard, express, overnight)
  - Address validation
  - Tracking number management
  - Estimated delivery dates
- **Order Analytics & Reporting**
  - Order statistics and metrics
  - Revenue tracking
  - Performance analytics

---

## 🛠️ Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a `.env` file** (see `.env` template)
3. **Start the server**
   ```bash
   npm run dev
   ```
4. **Test endpoints** using Postman or cURL

---

## 🛍️ Product Management Endpoints

### Public Endpoints (No Authentication Required)

- `GET    /api/v1/products` — Get all products with filtering and pagination
- `GET    /api/v1/products/categories` — Get product categories, subcategories, and brands
- `GET    /api/v1/products/featured` — Get featured products
- `GET    /api/v1/products/:id` — Get product by ID
- `GET    /api/v1/products/:id/related` — Get related products

### Seller Endpoints (Authentication Required)

- `POST   /api/v1/products` — Create a new product
- `PUT    /api/v1/products/:id` — Update product
- `DELETE /api/v1/products/:id` — Delete product (soft delete)
- `PATCH  /api/v1/products/:id/inventory` — Update product inventory
- `GET    /api/v1/products/seller/my-products` — Get seller's products

### Admin Endpoints (Authentication Required, Admin Only)

- `GET    /api/v1/products/admin/pending-approval` — Get products pending approval
- `PATCH  /api/v1/products/admin/:id/approve` — Approve a product
- `PATCH  /api/v1/products/admin/:id/reject` — Reject a product
- `PATCH  /api/v1/products/admin/:id/approval-status` — Update product approval status
- `PATCH  /api/v1/products/admin/bulk-approve` — Bulk approve products
- `PATCH  /api/v1/products/admin/bulk-reject` — Bulk reject products
- `PATCH  /api/v1/products/admin/:id/featured` — Set or unset product as featured
- `GET    /api/v1/products/admin/dashboard` — Get admin dashboard stats
- `GET    /api/v1/products/admin/all` — Get all products for admin (with approval status)

---

## 💳 Payment Gateway Integration (**COMPLETE**)

### Payment System Features

- **Secure Payment Processing**

  - Stripe integration for online payments
  - Payment intent creation and confirmation
  - Automatic payment status updates
  - Webhook handling for real-time updates

- **Payment Method Management**

  - Save and retrieve payment methods
  - Customer management in Stripe
  - Secure payment method storage

- **Refund Processing**

  - Automated refund processing through Stripe
  - Role-based refund permissions (seller/admin)
  - Refund status tracking

- **Order Integration**
  - Seamless integration with order management
  - Automatic order status updates on payment
  - Payment history tracking

### Payment Endpoints

#### Buyer Endpoints (Authentication Required)

- `POST   /api/v1/payments/create-intent` — Create payment intent for an order
- `POST   /api/v1/payments/confirm` — Confirm payment for an order
- `GET    /api/v1/payments/:orderId` — Get payment details for an order
- `GET    /api/v1/payments/methods` — Get user's saved payment methods
- `POST   /api/v1/payments/methods` — Save a payment method

#### Seller/Admin Endpoints (Authentication Required)

- `POST   /api/v1/payments/refund` — Process refund for an order

#### Public Endpoints (No Authentication Required)

- `POST   /api/v1/payments/webhook` — Stripe webhook endpoint

### Payment Flow Example

```json
// 1. Create Payment Intent
POST /api/v1/payments/create-intent
{
  "orderId": "507f1f77bcf86cd799439011"
}

// Response
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890",
    "amount": 70564,
    "currency": "inr"
  }
}

// 2. Confirm Payment
POST /api/v1/payments/confirm
{
  "orderId": "507f1f77bcf86cd799439011",
  "paymentIntentId": "pi_1234567890"
}

// 3. Process Refund
POST /api/v1/payments/refund
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 705.64,
  "reason": "Customer request"
}
```

### Environment Variables for Payment

Add these to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 📦 Order Management Endpoints

### Buyer Endpoints (Authentication Required, Buyer Role)

- `POST   /api/v1/orders` — Create a new order
- `GET    /api/v1/orders/my-orders` — Get buyer's orders with pagination
- `GET    /api/v1/orders/:orderId` — Get specific order details
- `PATCH  /api/v1/orders/:orderId/cancel` — Cancel order
- `PATCH  /api/v1/orders/:orderId/status` — Update order status (cancel only)
- `PATCH  /api/v1/orders/:orderId/return` — Initiate return for delivered order

### Seller Endpoints (Authentication Required, Seller Role)

- `GET    /api/v1/orders/seller/orders` — Get seller's orders with pagination
- `GET    /api/v1/orders/seller/:orderId` — Get specific order details
- `PATCH  /api/v1/orders/seller/:orderId/status` — Update order status (confirmed, processing, shipped, out_for_delivery)
- `PATCH  /api/v1/orders/seller/:orderId/cancel` — Cancel order
- `PATCH  /api/v1/orders/seller/:orderId/refund` — Process refund

### Admin Endpoints (Authentication Required, Admin Role)

- `GET    /api/v1/orders/admin/orders` — Get all orders with advanced filtering
- `GET    /api/v1/orders/admin/:orderId` — Get specific order details
- `PATCH  /api/v1/orders/admin/:orderId/status` — Update any order status
- `PATCH  /api/v1/orders/admin/:orderId/cancel` — Cancel any order
- `PATCH  /api/v1/orders/admin/:orderId/refund` — Process refund
- `PATCH  /api/v1/orders/admin/:orderId/payment` — Update payment status
- `GET    /api/v1/orders/admin/stats` — Get order statistics and analytics
- `DELETE /api/v1/orders/admin/:orderId` — Delete order (soft delete)

---

## 📦 Order Data Structure

### Complete Order Example

```json
{
  "orderNumber": "RJ2412010001",
  "buyerId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "sellerId": "507f1f77bcf86cd799439013",
      "quantity": 2,
      "price": 299,
      "productName": "The Great Gatsby",
      "productImage": "https://example.com/gatsby.jpg",
      "sellerName": "BookStore Pro"
    }
  ],
  "status": "pending",
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2024-12-01T10:00:00.000Z",
      "note": "Order created",
      "updatedBy": "507f1f77bcf86cd799439011"
    }
  ],
  "payment": {
    "method": "cod",
    "status": "pending",
    "transactionId": null,
    "amount": 705.64,
    "gateway": null,
    "paidAt": null
  },
  "shipping": {
    "address": {
      "name": "John Doe",
      "phone": "+1234567890",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "method": "standard",
    "cost": 50,
    "trackingNumber": null,
    "estimatedDelivery": null,
    "shippedAt": null,
    "deliveredAt": null
  },
  "totals": {
    "subtotal": 598,
    "tax": 107.64,
    "shipping": 50,
    "discount": 0,
    "total": 705.64
  },
  "notes": {
    "buyer": "Please deliver in the morning",
    "seller": null,
    "admin": null
  },
  "cancellationReason": null,
  "refundReason": null,
  "returnReason": null,
  "isActive": true,
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:00.000Z"
}
```

### Order Creation Request Example

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ],
  "payment": {
    "method": "cod"
  },
  "shipping": {
    "address": {
      "name": "John Doe",
      "phone": "+1234567890",
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "method": "standard"
  },
  "notes": {
    "buyer": "Please deliver in the morning"
  }
}
```

### Order Status Update Example

```json
{
  "status": "shipped",
  "note": "Order shipped via express delivery",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-12-08T10:00:00.000Z"
}
```

### Order Cancellation Example

```json
{
  "reason": "Changed my mind about the purchase"
}
```

### Return Request Example

```json
{
  "reason": "Book arrived damaged",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1,
      "reason": "Damaged during shipping"
    }
  ]
}
```

### Payment Status Update Example

```json
{
  "status": "completed",
  "transactionId": "TXN123456789",
  "gateway": "Stripe"
}
```

---

## 🧪 Testing

### Test Order Management System

```bash
# Run the comprehensive order management test
node test-orders.js
```

This test script covers:

- ✅ Authentication and user management
- ✅ Product creation and management
- ✅ Order creation and validation
- ✅ Order retrieval (buyer, seller, admin)
- ✅ Order status updates and workflow
- ✅ Order cancellation
- ✅ Refund processing
- ✅ Return processing
- ✅ Payment status management
- ✅ Order statistics and analytics
- ✅ Role-based access control

### Test Payment System

```bash
# Run the comprehensive payment system test
node test-payments.js
```

This test script covers:

- ✅ Authentication and user management
- ✅ Product creation and management
- ✅ Order creation and validation
- ✅ Payment intent creation
- ✅ Payment confirmation
- ✅ Payment details retrieval
- ✅ Payment method management
- ✅ Refund processing
- ✅ Access control and permissions
- ✅ Webhook handling simulation

---

## 📊 Order Status Flow

```
pending → confirmed → processing → shipped → out_for_delivery → delivered
    ↓
cancelled (from pending/confirmed)
    ↓
refunded (from delivered)
    ↓
returned (from delivered)
```

### Status Descriptions

- **pending**: Order created, waiting for seller confirmation
- **confirmed**: Seller has confirmed the order
- **processing**: Order is being prepared for shipping
- **shipped**: Order has been shipped with tracking
- **out_for_delivery**: Order is out for delivery
- **delivered**: Order has been successfully delivered
- **cancelled**: Order has been cancelled (buyer/seller/admin)
- **refunded**: Order has been refunded
- **returned**: Order has been returned by buyer

---

## 🔐 Role-based Permissions

### Buyer Permissions

- Create orders
- View own orders
- Cancel own orders (pending/confirmed status)
- Initiate returns for delivered orders
- Update order status (cancel only)

### Seller Permissions

- View orders containing their products
- Update order status (confirmed, processing, shipped, out_for_delivery)
- Cancel orders containing their products
- Process refunds for their products

### Admin Permissions

- View all orders
- Update any order status
- Cancel any order
- Process refunds
- Update payment status
- Access order statistics
- Delete orders (soft delete)

---

## 📈 Order Analytics

The system provides comprehensive analytics including:

- Total orders count
- Orders by status
- Total revenue
- Average order value
- Total items sold
- Performance metrics

---

## 🚀 Next Steps

With the order management system complete, the next features to implement are:

1. **Cart & Wishlist System** ✅ **COMPLETE**

   - Shopping cart management
   - Wishlist functionality
   - Save for later features

2. **Payment Gateway Integration** ✅ **COMPLETE**

   - Stripe integration
   - Payment webhooks
   - Secure payment processing
   - Payment method management
   - Refund processing

3. **Review & Rating System**

   - Product reviews
   - Rating aggregation
   - Review moderation

4. **Notification System**
   - Email notifications
   - SMS notifications
   - In-app notifications

---

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/readjunction
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRE=90d
CLIENT_URL=http://localhost:3000
```

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Built with ❤️ for ReadJunction**

---

# 🛠️ ReadJunction Server

A robust Node.js/Express backend for the ReadJunction ecommerce platform, featuring comprehensive user management, product catalog, cart/wishlist system, order management, and secure payment processing.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Buyer and seller registration, profiles, and management
- **Product Management**: CRUD operations with admin approval workflow
- **Cart & Wishlist System**: Comprehensive shopping experience
- **Order Management**: Multi-seller order processing and tracking
- **Payment Integration**: Secure Razorpay payment processing
- **Address Management**: Multiple address support for users
- **Admin Dashboard**: Platform management and analytics
- **Security**: Input validation, error handling, and logging

---

## 💳 Payment Integration (Razorpay)

### Overview

The server integrates with Razorpay for secure payment processing, supporting multiple payment methods including credit/debit cards, UPI, NetBanking, and digital wallets.

### Setup

#### 1. Install Dependencies

```bash
npm install razorpay
```

#### 2. Environment Configuration

Add to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

#### 3. Get API Keys

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create/Login to your account
3. Go to **Settings → API Keys**
4. Generate new key pair
5. Copy Key ID and Key Secret

### API Endpoints

#### Payment Routes

```javascript
// All routes require authentication
router.use(protect);

// Create Razorpay order
router.post("/create-order", PaymentController.createRazorpayOrder);

// Verify payment
router.post("/verify", PaymentController.verifyPayment);

// Process refund
router.post("/refund", PaymentController.processRefund);

// Get payment details
router.get("/:orderId", PaymentController.getPaymentDetails);
```

### Payment Flow

#### 1. Create Order

```javascript
// Frontend creates order first
POST /api/v1/orders
{
  "items": [...],
  "payment": { "method": "razorpay" },
  "shipping": { ... }
}

// Then create Razorpay order
POST /api/v1/payments/create-order
{
  "orderId": "order_id_from_previous_step"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "internal_order_id",
    "razorpayOrderId": "order_ABC123",
    "amount": 10308,
    "currency": "INR",
    "receipt": "RJ2507190001",
    "key": "rzp_test_your_key_id"
  }
}
```

#### 2. Process Payment

Frontend uses Razorpay SDK to process payment:

```javascript
const options = {
  key: razorpayOrderData.key,
  amount: razorpayOrderData.amount,
  currency: razorpayOrderData.currency,
  order_id: razorpayOrderData.razorpayOrderId,
  handler: function (response) {
    // Payment successful
  },
};
```

#### 3. Verify Payment

```javascript
POST /api/v1/payments/verify
{
  "orderId": "internal_order_id",
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_XYZ789",
  "razorpaySignature": "signature_hash"
}
```

### Service Methods

#### PaymentService.createRazorpayOrder(order, currency)

Creates a Razorpay order for payment processing.

```javascript
const razorpayOrder = await PaymentService.createRazorpayOrder(order, "INR");
```

**Parameters:**

- `order`: Order object with totals and details
- `currency`: Currency code (default: "INR")

**Returns:**

```javascript
{
  razorpayOrderId: "order_ABC123",
  amount: 10308,
  currency: "INR",
  receipt: "RJ2507190001"
}
```

#### PaymentService.verifyPaymentSignature(orderId, paymentId, signature)

Verifies payment signature for security.

```javascript
const isValid = await PaymentService.verifyPaymentSignature(
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
);
```

#### PaymentService.getPaymentDetails(paymentId)

Retrieves payment details from Razorpay.

```javascript
const paymentDetails = await PaymentService.getPaymentDetails(paymentId);
```

#### PaymentService.processRefund(paymentId, amount, reason)

Processes refund for a payment.

```javascript
const refundResult = await PaymentService.processRefund(
  paymentId,
  amount,
  "requested_by_customer"
);
```

### Error Handling

The payment system includes comprehensive error handling:

```javascript
// Invalid order
if (!order) {
  throw new ApiError(404, "Order not found");
}

// Already paid
if (order.payment.status === "completed") {
  throw new ApiError(400, "Order is already paid");
}

// Invalid signature
if (!isAuthentic) {
  throw new ApiError(400, "Invalid payment signature");
}

// Payment not successful
if (paymentDetails.status !== "captured") {
  throw new ApiError(
    400,
    `Payment not successful. Status: ${paymentDetails.status}`
  );
}
```

### Testing

#### Test Cards

- **Successful Payment**: `4111 1111 1111 1111`
- **Failed Payment**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

#### Test Environment

1. Use test API keys (`rzp_test_...`)
2. Test with small amounts
3. Verify payment signatures
4. Check error scenarios

### Security Features

- **Signature Verification**: HMAC-SHA256 signature verification
- **Environment Variables**: Secure API key storage
- **Input Validation**: Comprehensive validation
- **Error Logging**: Detailed error tracking
- **PCI Compliance**: Razorpay handles PCI DSS compliance

### Troubleshooting

#### Common Issues

1. **"key_id or oauthToken is mandatory"**

   - Check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env
   - Restart server after adding environment variables

2. **"Invalid payment signature"**

   - Verify signature calculation matches Razorpay documentation
   - Check if all required fields are included in signature

3. **"Order not found"**

   - Ensure order exists and belongs to the authenticated user
   - Check if order is active and not already paid

4. **"Payment not successful"**
   - Verify payment status from Razorpay
   - Check if payment was captured successfully

#### Debug Mode

Enable detailed logging by adding console.log statements in PaymentService methods.

---

## 🛒 Cart & Wishlist System
