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
- `GET    /api/v1/products/admin/dashboard` — Get admin dashboard stats
- `GET    /api/v1/products/admin/all` — Get all products for admin (with approval status)

---

## 📦 Product Data Structure

### Complete Product Example

```json
{
  "title": "iPhone 15 Pro",
  "description": "The latest iPhone with advanced features and premium design",
  "shortDescription": "Premium smartphone with cutting-edge technology",
  "category": "Electronics",
  "subcategory": "Smartphones",
  "brand": "Apple",
  "sku": "IPHONE15PRO-128",
  "price": 999.99,
  "comparePrice": 1099.99,
  "costPrice": 800.0,
  "images": [
    {
      "url": "https://example.com/iphone15pro-1.jpg",
      "alt": "iPhone 15 Pro Front View",
      "isPrimary": true
    },
    {
      "url": "https://example.com/iphone15pro-2.jpg",
      "alt": "iPhone 15 Pro Back View"
    }
  ],
  "inventory": {
    "quantity": 50,
    "lowStockThreshold": 10,
    "trackInventory": true,
    "allowBackorder": false,
    "maxOrderQuantity": 5
  },
  "variants": [
    {
      "name": "Color",
      "options": ["Natural Titanium", "Blue Titanium", "White Titanium"],
      "priceModifier": 0
    },
    {
      "name": "Storage",
      "options": ["128GB", "256GB", "512GB", "1TB"],
      "priceModifier": 100
    }
  ],
  "specifications": [
    {
      "name": "Screen Size",
      "value": "6.1 inches"
    },
    {
      "name": "Processor",
      "value": "A17 Pro chip"
    },
    {
      "name": "Battery",
      "value": "Up to 23 hours video playback"
    }
  ],
  "tags": ["smartphone", "iphone", "apple", "5g", "camera"],
  "seo": {
    "metaTitle": "iPhone 15 Pro - Latest Apple Smartphone",
    "metaDescription": "Buy iPhone 15 Pro with advanced features, premium design, and cutting-edge technology",
    "slug": "iphone-15-pro"
  },
  "shipping": {
    "weight": 187,
    "dimensions": {
      "length": 14.7,
      "width": 7.1,
      "height": 0.8
    },
    "freeShipping": true,
    "shippingClass": "premium"
  }
}
```

### Inventory Management Example

```json
{
  "quantity": 100,
  "operation": "set" // "set", "increase", or "decrease"
}
```

### Admin Product Approval Example

**Approve:**

```json
{
  "notes": "Product meets all requirements."
}
```

**Reject:**

```json
{
  "notes": "Missing required info.",
  "reason": "Incomplete details"
}
```

**Bulk Approve/Reject:**

```json
{
  "productIds": ["id1", "id2"],
  "notes": "Bulk operation",
  "reason": "Reason for rejection" // only for bulk-reject
}
```

---

## 🧑‍💻 Example: Register as Seller

```json
{
  "email": "seller@example.com",
  "password": "SellerPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "seller",
  "businessInfo": {
    "businessName": "Tech Store",
    "businessDescription": "Premium electronics and gadgets",
    "businessType": "retail",
    "taxId": "12-3456789",
    "businessAddress": {
      "street": "123 Business St",
      "city": "Business City",
      "state": "CA",
      "zipCode": "90210",
      "country": "United States"
    },
    "bankDetails": {
      "accountNumber": "1234567890",
      "routingNumber": "987654321",
      "accountHolderName": "Tech Store",
      "bankName": "Tech Bank"
    }
  }
}
```

---

## 🧪 Testing

### Test Product Management

```bash
node test-products.js
```

The product test script includes:

- Seller login
- Product creation with full data
- Product listing with filters
- Product updates and inventory management
- Search and category functionality
- Authorization testing
- Validation testing

---

## 🛡️ Security & Best Practices

- **Authentication & Authorization**
  - Passwords hashed with bcrypt
  - JWT tokens for authentication
  - Refresh tokens stored in HTTP-only cookies
  - Role-based access control
- **Data Validation**
  - Comprehensive Joi validation schemas
  - Input sanitization and type checking
  - Custom error messages for better UX
- **Database Security**
  - MongoDB injection prevention
  - Proper indexing for performance
  - Data validation at schema level
- **API Security**
  - Helmet for security headers
  - CORS configuration
  - Rate limiting (to be implemented)
  - Request size limits

---

## 📊 Product Management Features

### Advanced Product Features

- **Virtual Fields**: Automatic calculation of discount percentage, stock status
- **Inventory Tracking**: Real-time stock management with low stock alerts
- **Product Variants**: Support for multiple options (size, color, etc.)
- **SEO Optimization**: Meta tags, custom slugs, and search optimization
- **Shipping Integration**: Weight, dimensions, and shipping class support
- **Performance Optimization**: Database indexing for fast queries
- **Soft Deletes**: Products are marked inactive rather than deleted

### Scalability Features

- **Pagination**: Efficient handling of large product catalogs
- **Filtering**: Multiple filter options for better product discovery
- **Search**: Full-text search across product data
- **Caching Ready**: Structure supports Redis caching implementation
- **API Versioning**: Versioned API endpoints for future compatibility

---

## 📣 Next Steps

### Phase 1: Core Ecommerce (**Product Management: COMPLETE**)

- ✅ Authentication & User Management
- ✅ Product Management System (**COMPLETE & TESTED**)
- 🔄 Order Management System
- 🔄 Shopping Cart Functionality
- 🔄 Payment Integration

### Phase 2: Advanced Features

- 🔄 Product Reviews & Ratings
- 🔄 Wishlist Functionality
- 🔄 Advanced Search (Elasticsearch)
- 🔄 Email Notifications
- 🔄 Real-time Updates (WebSockets)

### Phase 3: Scalability

- 🔄 Caching Layer (Redis)
- 🔄 File Upload & CDN
- 🔄 Analytics & Reporting
- 🔄 Admin Dashboard
- 🔄 Multi-tenancy Support

---

**Made with ❤️ for ReadJunction**
