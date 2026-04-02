// ─── Base URL ─────────────────────────────────────────────────────────────────
export const API = import.meta.env.VITE_API || "http://localhost:5000/api";

// ─── Product helper: transform raw server product to app shape ────────────────
export const transformProduct = (item) => ({
  id: item._id,
  name: item.name,
  vendor: item.vendor?.shopName || "Unknown Store",
  vendorId: item.vendor?._id,
  category: item.category?.name || "Uncategorized",
  price: item.price,
  original: item.orginalPrice,
  district: item.district?.replace("📍 ", "") || "",
  rating: item.rating || 0,
  reviews: item.reviews || 0,
  emoji: item.emoji || "🛍️",
  stock: item.stock,
  thumb: item.images?.[0] || null,
  images:
    item.images?.map((url, i) => ({
      url,
      label: i === 0 ? "Front View" : `View ${i + 1}`,
    })) || [],
  desc: item.description || "",
  isActive: item.isActive,
});

// ─── Vendor helper ────────────────────────────────────────────────────────────
export const transformVendor = (v) => ({
  id: v._id,
  name: v.shopName,
  owner: v.name,
  district: v.address,
  rating: v.rating || 4.5,
  products: v.products?.length || 0,
  avatar: "🛍️",
  category: "Handmade",
});

// ─── Products ─────────────────────────────────────────────────────────────────
// Paginated fetch — returns { products, pagination }
export const fetchProductsPage = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  const res = await fetch(`${API}/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return {
    products:   data.products.map(transformProduct),
    pagination: data.pagination,
  };
};

// Backwards compat — used by HomePage carousel initial load (first page only)
export const fetchAllProducts = async () => {
  const { products } = await fetchProductsPage({ page: 1, limit: 10 });
  return products;
};

export const fetchVendorProducts = async (vendorId) => {
  const res = await fetch(`${API}/products/vendor/${vendorId}`);
  if (!res.ok) throw new Error("Failed to fetch vendor products");
  const data = await res.json();
  return data.map(transformProduct);
};

export const createProduct = async (formData) => {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create product");
  return data;
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const fetchAllCategories = async () => {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const fetchAllVendors = async () => {
  const res = await fetch(`${API}/vendors`);
  if (!res.ok) throw new Error("Failed to fetch vendors");
  const data = await res.json();
  return data.vendors.map(transformVendor);
};

export const loginVendor = async (credentials) => {
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerVendor = async (vendorData) => {
  const res = await fetch(`${API}/vendors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendorData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginCustomer = async (credentials) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerCustomer = async (customerData) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const fetchCart = async (userId) => {
  const res = await fetch(`${API}/cart/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

export const addToCartAPI = async (productId, userId) => {
  const res = await fetch(`${API}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1, user: { id: userId } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add to cart");
  return data;
};

export const removeFromCartAPI = async (productId, userId) => {
  const res = await fetch(`${API}/cart/remove/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { id: userId } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to remove item");
  return data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const fetchUserOrders = async (userId) => {
  const res = await fetch(`${API}/orders/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const fetchVendorOrders = async (vendorId) => {
  const res = await fetch(`${API}/orders/vendor/${vendorId}`);
  if (!res.ok) throw new Error("Failed to fetch vendor orders");
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create order");
  return data;
};

// ─── Addresses ────────────────────────────────────────────────────────────────
export const fetchAddresses = async (userId) => {
  const res = await fetch(`${API}/addresses/my/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
};

export const createAddress = async (addressData) => {
  const res = await fetch(`${API}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add address");
  return data;
};

// ─── Payment (see UPI section below) ───────────────────────────────────────
export const addContactMessage = async (messageData) => {
  const res = await fetch(`${API}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send message");
  return data;
};
export const fetchContactMessages = async () => {
  const res = await fetch(`${API}/contact/all`);
  if (!res.ok) throw new Error("Failed to fetch contact messages");
  return res.json();
};


// ─── Auth - Forgot / Reset / Change Password ──────────────────────────────────
export const forgotPassword = async (email) => {
  const res = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to send reset email");
  return data;
};

export const resetPassword = async (customerId, token, newPassword) => {
  const res = await fetch(`${API}/auth/reset-password/${customerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to reset password");
  return data;
};

export const changePassword = async (customerId, currentPassword, newPassword) => {
  const res = await fetch(`${API}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to change password");
  return data;
};

// ─── Addresses (extended) ────────────────────────────────────────────────────
export const updateAddress = async (addressId, addressData) => {
  const res = await fetch(`${API}/addresses/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update address");
  return data;
};

export const deleteAddress = async (addressId) => {
  const res = await fetch(`${API}/addresses/${addressId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete address");
  return data;
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export const sendChatMessage = async (question, history = []) => {
  const res = await fetch(`${API}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Chatbot error");
  return data;
};
// ─── Google Auth ──────────────────────────────────────────────────────────────
export const googleLoginCustomer = async (credential) => {
  const res = await fetch(`${API}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Google login failed");
  return data;
};

export const googleLoginVendor = async (credential) => {
  const res = await fetch(`${API}/vendors/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Google login failed");
  return data;
};

// ─── UPI Payment ──────────────────────────────────────────────────────────────
export const getUpiDetails = async (orderId) => {
  const res = await fetch(`${API}/payment/upi/${orderId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to get UPI details");
  return data;
};

export const confirmUpiPayment = async ({ orderId, upiTransactionId }) => {
  const res = await fetch(`${API}/payment/upi/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, upiTransactionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to confirm payment");
  return data;
};

// ─── Refunds ──────────────────────────────────────────────────────────────────
export const requestRefund = async ({ orderId, reason }) => {
  const res = await fetch(`${API}/payment/refund/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Refund request failed");
  return data;
};

export const processRefund = async ({ orderId, action, refundAmount }) => {
  const res = await fetch(`${API}/payment/refund/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, action, refundAmount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Refund processing failed");
  return data;
};

export const fetchRefundRequests = async (vendorId) => {
  const url = vendorId
    ? `${API}/payment/refunds?vendorId=${vendorId}`
    : `${API}/payment/refunds`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch refund requests");
  return res.json();
};

// ─── Order Report ─────────────────────────────────────────────────────────────
export const fetchOrderReport = async ({ vendorId, startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  if (vendorId) params.set("vendorId", vendorId);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`${API}/payment/report?${params}`);
  if (!res.ok) throw new Error("Failed to fetch order report");
  return res.json();
};
