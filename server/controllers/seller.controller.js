const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

// Get seller analytics/dashboard stats
const getSellerAnalytics = asyncHandler(async (req, res) => {
  // Fetch the Seller document for the current user
  const seller = await require("../models/seller.model").findOne({
    userId: req.user._id,
  });
  if (!seller) {
    throw new ApiError(404, "Seller profile not found");
  }
  const sellerId = seller._id;

  // Get current date and calculate date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Get all orders for this seller
    const allOrders = await Order.find({
      "items.sellerId": sellerId,
      status: { $nin: ["cancelled", "refunded"] },
    }).populate("buyerId", "firstName lastName email");

    // Get products count
    const totalProducts = await Product.countDocuments({
      sellerId: sellerId,
      status: "active",
    });

    // Calculate total revenue (in paise, convert to rupees)
    const totalRevenue =
      allOrders.reduce((sum, order) => {
        const sellerItems = order.items.filter(
          (item) => item.sellerId.toString() === sellerId.toString()
        );
        return (
          sum +
          sellerItems.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0
          )
        );
      }, 0) / 100; // Convert from paise to rupees

    // Calculate total sales count
    const totalSales = allOrders.length;

    // Get unique customers
    const uniqueCustomers = new Set();
    allOrders.forEach((order) => {
      uniqueCustomers.add(order.buyerId._id.toString());
    });

    // Calculate monthly revenue
    const monthlyOrders = allOrders.filter(
      (order) => order.createdAt >= startOfMonth
    );
    const monthlyRevenue =
      monthlyOrders.reduce((sum, order) => {
        const sellerItems = order.items.filter(
          (item) => item.sellerId.toString() === sellerId.toString()
        );
        return (
          sum +
          sellerItems.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0
          )
        );
      }, 0) / 100;

    // Calculate yearly revenue
    const yearlyOrders = allOrders.filter(
      (order) => order.createdAt >= startOfYear
    );
    const yearlyRevenue =
      yearlyOrders.reduce((sum, order) => {
        const sellerItems = order.items.filter(
          (item) => item.sellerId.toString() === sellerId.toString()
        );
        return (
          sum +
          sellerItems.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0
          )
        );
      }, 0) / 100;

    // Get recent orders (last 30 days)
    const recentOrders = allOrders.filter(
      (order) => order.createdAt >= thirtyDaysAgo
    );

    // Calculate average order value
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Get top selling products
    const productSales = {};
    allOrders.forEach((order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId.toString() === sellerId.toString()
      );
      sellerItems.forEach((item) => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue +=
            (item.price * item.quantity) / 100;
        } else {
          productSales[item.productId] = {
            productName: item.productName,
            quantity: item.quantity,
            revenue: (item.price * item.quantity) / 100,
          };
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get order status distribution
    const statusDistribution = {};
    allOrders.forEach((order) => {
      statusDistribution[order.status] =
        (statusDistribution[order.status] || 0) + 1;
    });

    // Get recent activity
    const recentActivity = allOrders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map((order) => ({
        type: "order",
        orderNumber: order.orderNumber,
        amount:
          order.items
            .filter((item) => item.sellerId.toString() === sellerId.toString())
            .reduce((sum, item) => sum + item.price * item.quantity, 0) / 100,
        status: order.status,
        customerName: `${order.buyerId.firstName} ${order.buyerId.lastName}`,
        timestamp: order.createdAt,
      }));

    // Format currency for Indian Rupees
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const analytics = {
      overview: {
        totalProducts,
        totalRevenue: formatCurrency(totalRevenue),
        totalSales,
        totalCustomers: uniqueCustomers.size,
        averageOrderValue: formatCurrency(averageOrderValue),
      },
      revenue: {
        total: formatCurrency(totalRevenue),
        monthly: formatCurrency(monthlyRevenue),
        yearly: formatCurrency(yearlyRevenue),
        currency: "INR",
      },
      recent: {
        orders: recentOrders.length,
        revenue: formatCurrency(
          recentOrders.reduce((sum, order) => {
            const sellerItems = order.items.filter(
              (item) => item.sellerId.toString() === sellerId.toString()
            );
            return (
              sum +
              sellerItems.reduce(
                (itemSum, item) => itemSum + item.price * item.quantity,
                0
              )
            );
          }, 0) / 100
        ),
      },
      topProducts,
      statusDistribution,
      recentActivity,
      rawData: {
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        averageOrderValue,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analytics,
          "Seller analytics retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Error fetching seller analytics: " + error.message
    );
  }
});

// Get seller products with analytics
const getSellerProducts = asyncHandler(async (req, res) => {
  // Fetch the Seller document for the current user
  const seller = await require("../models/seller.model").findOne({
    userId: req.user._id,
  });
  if (!seller) {
    throw new ApiError(404, "Seller profile not found");
  }
  const sellerId = seller._id;
  const { page = 1, limit = 10, status, category } = req.query;

  const query = { sellerId };
  if (status) query.status = status;
  if (category) query.category = category;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  const products = await Product.find(query)
    .limit(options.limit)
    .skip((options.page - 1) * options.limit)
    .sort(options.sort);

  const total = await Product.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
      "Seller products retrieved successfully"
    )
  );
});

// Get seller orders
const getSellerOrders = asyncHandler(async (req, res) => {
  // Fetch the Seller document for the current user
  const seller = await require("../models/seller.model").findOne({
    userId: req.user._id,
  });
  if (!seller) {
    throw new ApiError(404, "Seller profile not found");
  }
  const sellerId = seller._id;
  const { page = 1, limit = 10, status } = req.query;

  const query = { "items.sellerId": sellerId };
  if (status) query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  const orders = await Order.find(query)
    .populate("buyerId", "firstName lastName email")
    .limit(options.limit)
    .skip((options.page - 1) * options.limit)
    .sort(options.sort);

  const total = await Order.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
      "Seller orders retrieved successfully"
    )
  );
});

module.exports = {
  getSellerAnalytics,
  getSellerProducts,
  getSellerOrders,
};
