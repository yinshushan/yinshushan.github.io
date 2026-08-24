const API_BASE_URL = "https://api.example.com";

function request(path, options = {}) {
  const token = wx.getStorageSync("yuTeaAccessToken");
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${path}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data.data);
        else reject(response.data.error || { code: "HTTP_ERROR", message: `HTTP ${response.statusCode}` });
      },
      fail: reject,
    });
  });
}

export async function wechatLogin() {
  const login = await new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }));
  const session = await request("/v1/auth/wechat-login", { method: "POST", data: { code: login.code } });
  wx.setStorageSync("yuTeaAccessToken", session.accessToken);
  wx.setStorageSync("yuTeaRefreshToken", session.refreshToken);
  return session;
}

export const yuTeaApi = {
  categories: () => request("/v1/catalog/categories"),
  products: (categoryId) => request(`/v1/catalog/products?categoryId=${encodeURIComponent(categoryId)}`),
  product: (id) => request(`/v1/catalog/products/${encodeURIComponent(id)}`),
  membership: () => request("/v1/membership"),
  joinMembership: () => request("/v1/membership/join", { method: "POST", data: {} }),
  cart: () => request("/v1/cart"),
  addToCart: (productId, quantity = 1) => request("/v1/cart/items", { method: "POST", data: { productId, quantity } }),
  quoteCart: (data) => request("/v1/cart/quote", { method: "POST", data }),
  createOrder: (data) => request("/v1/orders", { method: "POST", data, idempotencyKey: `order-${Date.now()}` }),
  createPayment: (orderId) => request("/v1/payments", { method: "POST", data: { orderId } }),
  events: () => request("/v1/events"),
  reserveEvent: (id) => request(`/v1/events/${encodeURIComponent(id)}/reserve`, { method: "POST", data: {} }),
  content: (type) => request(`/v1/content${type ? `?type=${encodeURIComponent(type)}` : ""}`),
  trace: (batchId) => request(`/v1/trace/${encodeURIComponent(batchId)}`),
};
