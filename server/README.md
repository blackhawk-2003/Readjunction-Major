# 📚 ReadJunction Server

A robust, scalable backend for the ReadJunction ecommerce platform, built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Features Implemented So Far

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
- **Get Current User**
  - Retrieve user profile and seller info (if applicable)
- **Centralized Error Handling**
  - Consistent error responses and 404 handling
- **Validation**
  - Joi-based request validation for all auth endpoints
- **Clean Project Structure**
  - Modular folders for models, controllers, routes, middleware, and validators
- **Environment Config**
  - `.env` support for secrets and database config
- **Security Best Practices**
  - Helmet, CORS, cookie-parser, and more

---

## 📁 Project Structure

```
server/
├── controllers/      # Route controllers (e.g., auth.controller.js)
├── middleware/       # Express middleware (auth, errorHandler, etc.)
├── models/           # Mongoose models (User, Seller, Product, Order, Cart)
├── routes/           # Express route definitions (auth.routes.js)
├── validators/       # Joi validation schemas
├── .env              # Environment variables (not committed)
├── .gitignore        # Git ignore rules
├── package.json      # Project dependencies and scripts
├── server.js         # Main entry point
└── README.md         # This file
```

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

## 🔑 Authentication Endpoints

- `POST   /api/v1/auth/register` — Register as buyer or seller
- `POST   /api/v1/auth/login` — Login
- `POST   /api/v1/auth/logout` — Logout
- `POST   /api/v1/auth/refresh-token` — Refresh JWT token
- `GET    /api/v1/auth/me` — Get current user (and seller info)
- `POST   /api/v1/auth/forgot-password` — Request password reset
- `POST   /api/v1/auth/reset-password/:resetToken` — Reset password

---

## 🧑‍💻 Example: Register as Seller

```json
{
  "email": "seller@example.com",
  "password": "SellerPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "seller",
  "businessName": "Test Business",
  "businessDescription": "A test business for ReadJunction",
  "businessAddress": {
    "street": "123 Business St",
    "city": "Business City",
    "state": "CA",
    "zipCode": "90210",
    "country": "United States"
  },
  "taxId": "12-3456789",
  "bankDetails": {
    "accountNumber": "1234567890",
    "routingNumber": "021000021",
    "bankName": "Test Bank",
    "accountHolderName": "Jane Smith"
  }
}
```

---

## 🛡️ Security & Best Practices

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Refresh tokens stored in HTTP-only cookies
- All sensitive config in `.env` (never committed)
- Modular, maintainable codebase

---

## 📣 Next Steps

- Product management (CRUD)
- Order system
- Seller/buyer dashboards
- Admin features

---

**Made with ❤️ for ReadJunction**
