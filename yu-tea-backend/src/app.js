import { createHash, randomUUID } from "node:crypto";
import { URL } from "node:url";
import { ApiError, assert } from "./errors.js";
import { bearerToken, hashToken, newId, newToken, requireAdmin } from "./security.js";
import { buildOpenApi } from "./openapi.js";

const JSON_LIMIT = 1024 * 1024;
const SESSION_TTL = 2 * 60 * 60 * 1000;
const REFRESH_TTL = 30 * 24 * 60 * 60 * 1000;

function now() {
  return new Date().toISOString();
}

function sha(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function amount(value, field = "amount") {
  const parsed = Number(value);
  assert(Number.isInteger(parsed) && parsed >= 0, 400, "INVALID_AMOUNT", `${field} 必须是非负整数分值`);
  return parsed;
}

function positiveInteger(value, field = "quantity", max = 99) {
  const parsed = Number(value);
  assert(Number.isInteger(parsed) && parsed > 0 && parsed <= max, 400, "INVALID_QUANTITY", `${field} 必须为 1-${max} 的整数`);
  return parsed;
}

function routePattern(pattern) {
  const names = [];
  const source = pattern.split("/").map((part) => {
    if (!part.startsWith(":")) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    names.push(part.slice(1));
    return "([^/]+)";
  }).join("/");
  return { regex: new RegExp(`^${source}/?$`), names };
}

function paginate(items, query) {
  const page = Math.max(1, Number.parseInt(query.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.get("pageSize") || "20", 10)));
  const total = items.length;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) } };
}

async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return {};
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > JSON_LIMIT) throw new ApiError(413, "BODY_TOO_LARGE", "请求体不能超过 1MB");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const contentType = request.headers["content-type"] || "";
  assert(contentType.includes("application/json"), 415, "JSON_REQUIRED", "请使用 application/json");
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "INVALID_JSON", "JSON 请求体无法解析");
  }
}

function send(response, status, payload, requestId, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-request-id": requestId,
    ...extraHeaders,
  });
  response.end(body);
}

function presentProduct(product) {
  return { ...product, priceYuan: Number((product.price / 100).toFixed(2)) };
}

function publicUser(user) {
  if (!user) return null;
  const { openid, unionid, phone, ...safe } = user;
  return { ...safe, phoneBound: Boolean(phone), wechatBound: Boolean(openid || unionid) };
}

function issueTokens(data, userId) {
  const accessToken = newToken("yta");
  const refreshToken = newToken("ytr");
  const createdAt = Date.now();
  data.sessions.push({ id: newId("ses"), userId, tokenHash: hashToken(accessToken), createdAt: new Date(createdAt).toISOString(), expiresAt: new Date(createdAt + SESSION_TTL).toISOString() });
  data.refreshTokens.push({ id: newId("ref"), userId, tokenHash: hashToken(refreshToken), createdAt: new Date(createdAt).toISOString(), expiresAt: new Date(createdAt + REFRESH_TTL).toISOString(), revokedAt: null });
  return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: SESSION_TTL / 1000 };
}

function authenticate(store, headers) {
  const token = bearerToken(headers);
  assert(token, 401, "AUTH_REQUIRED", "请先登录");
  const tokenHash = hashToken(token);
  const session = store.read((data) => data.sessions.find((item) => item.tokenHash === tokenHash));
  assert(session && Date.parse(session.expiresAt) > Date.now(), 401, "SESSION_EXPIRED", "登录状态已失效");
  const user = store.read((data) => data.users.find((item) => item.id === session.userId));
  assert(user, 401, "USER_NOT_FOUND", "用户不存在");
  return user;
}

function getCart(data, userId) {
  let cart = data.carts.find((item) => item.userId === userId);
  if (!cart) {
    cart = { id: newId("cart"), userId, items: [], updatedAt: now() };
    data.carts.push(cart);
  }
  return cart;
}

function cartView(data, userId) {
  const cart = getCart(data, userId);
  const items = cart.items.map((item) => {
    const product = data.products.find((entry) => entry.id === item.productId);
    return { product: presentProduct(product), quantity: item.quantity, lineTotal: product.price * item.quantity };
  });
  return { id: cart.id, items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0), updatedAt: cart.updatedAt };
}

function shippingQuote(data, { countryCode = "CN", weightGrams = 500, subtotal = 0 }) {
  const country = data.shippingCountries.find((item) => item.code === countryCode);
  assert(country, 400, "COUNTRY_NOT_SUPPORTED", "暂不支持该国家或地区的配送");
  const units = Math.max(1, Math.ceil(Number(weightGrams || 500) / 500));
  const fee = country.code === "CN" && subtotal >= 19900 ? 0 : country.baseFee + Math.max(0, units - 1) * country.per500gFee;
  return { country, fee, currency: "CNY", estimatedDays: country.etaDays, customsRequired: country.customsRequired };
}

function quoteCart(data, userId, input = {}) {
  const cart = cartView(data, userId);
  assert(cart.items.length, 400, "CART_EMPTY", "购物车还是空的");
  const weightGrams = cart.items.reduce((sum, item) => {
    const parsed = Number.parseInt(item.product.size, 10);
    return sum + (Number.isFinite(parsed) ? parsed : 100) * item.quantity;
  }, 0);
  let discount = 0;
  let coupon = null;
  if (input.couponId) {
    const owned = data.userCoupons.find((item) => item.userId === userId && item.couponId === input.couponId && item.status === "available");
    assert(owned, 400, "COUPON_UNAVAILABLE", "优惠券不可用");
    coupon = data.coupons.find((item) => item.id === input.couponId);
    assert(coupon && cart.subtotal >= coupon.minimumSpend, 400, "COUPON_THRESHOLD_NOT_MET", "未达到优惠券使用门槛");
    discount = coupon.type === "fixed" ? coupon.discount : Math.floor(cart.subtotal * coupon.discount / 10000);
  }
  const shipping = shippingQuote(data, { countryCode: input.countryCode || "CN", weightGrams, subtotal: cart.subtotal });
  const total = Math.max(0, cart.subtotal - discount + shipping.fee);
  return { cart, subtotal: cart.subtotal, discount, shippingFee: shipping.fee, total, currency: "CNY", coupon, shipping, weightGrams };
}

function ownedOrder(data, userId, orderId) {
  const order = data.orders.find((item) => item.id === orderId && item.userId === userId);
  assert(order, 404, "ORDER_NOT_FOUND", "订单不存在");
  return order;
}

function completePayment(data, payment, transactionId) {
  if (payment.status === "paid") return payment;
  const order = data.orders.find((item) => item.id === payment.orderId);
  assert(order, 404, "ORDER_NOT_FOUND", "订单不存在");
  assert(order.status === "pending_payment", 409, "ORDER_NOT_PAYABLE", "当前订单不可支付");
  for (const item of order.items) {
    const product = data.products.find((entry) => entry.id === item.productId);
    assert(product.stock >= item.quantity, 409, "OUT_OF_STOCK", `${product.name} 库存不足`);
  }
  for (const item of order.items) data.products.find((entry) => entry.id === item.productId).stock -= item.quantity;
  payment.status = "paid";
  payment.transactionId = transactionId;
  payment.paidAt = now();
  order.status = "paid";
  order.paidAt = payment.paidAt;
  order.updatedAt = payment.paidAt;
  if (order.couponId) {
    const coupon = data.userCoupons.find((item) => item.userId === order.userId && item.couponId === order.couponId && item.status === "available");
    if (coupon) {
      coupon.status = "used";
      coupon.usedAt = payment.paidAt;
      coupon.orderId = order.id;
    }
  }
  const points = Math.floor(order.total / 100);
  const membership = data.memberships.find((item) => item.userId === order.userId);
  if (membership) {
    membership.points += points;
    membership.updatedAt = now();
    data.pointsLedger.push({ id: newId("pt"), userId: order.userId, amount: points, type: "purchase", note: `订单 ${order.orderNo} 消费积分`, orderId: order.id, createdAt: now() });
  }
  data.notifications.push({ id: newId("ntf"), userId: order.userId, type: "order", title: "支付成功", body: `订单 ${order.orderNo} 已支付`, readAt: null, createdAt: now() });
  return payment;
}

export function createApi({ config, store }) {
  const routes = [];
  const add = (method, pattern, options, handler) => {
    if (typeof options === "function") [handler, options] = [options, {}];
    const compiled = routePattern(pattern);
    routes.push({ method, pattern, ...compiled, options, handler });
  };

  add("GET", "/health", () => ({ status: "ok", service: "yu-tea-backend", time: now(), persistence: store.file ? "json" : "memory" }));
  add("GET", "/openapi.json", () => buildOpenApi(config.publicBaseUrl));

  add("POST", "/v1/auth/wechat-login", async ({ body }) => store.update((data) => {
    assert(body.code, 400, "WECHAT_CODE_REQUIRED", "缺少微信登录 code");
    if (config.authMode !== "mock") {
      assert(config.wechat.appId && config.wechat.appSecret, 503, "WECHAT_NOT_CONFIGURED", "微信应用凭据未配置");
      throw new ApiError(501, "WECHAT_ADAPTER_REQUIRED", "已启用真实模式，请接入 code2Session 网络适配器");
    }
    const openid = `mock_${sha(body.mockOpenId || body.code).slice(0, 20)}`;
    let user = data.users.find((item) => item.openid === openid);
    if (!user) {
      user = { id: newId("usr"), openid, unionid: null, nickname: body.userProfile?.nickname || "茶友", avatarUrl: body.userProfile?.avatarUrl || null, phone: null, locale: body.userProfile?.locale || "zh-CN", createdAt: now(), updatedAt: now() };
      data.users.push(user);
    } else if (body.userProfile) {
      user.nickname = body.userProfile.nickname || user.nickname;
      user.avatarUrl = body.userProfile.avatarUrl || user.avatarUrl;
      user.updatedAt = now();
    }
    return { user: publicUser(user), ...issueTokens(data, user.id), isNewUser: data.users.filter((item) => item.openid === openid).length === 1 && !data.memberships.some((item) => item.userId === user.id) };
  }));

  add("POST", "/v1/auth/refresh", async ({ body }) => store.update((data) => {
    assert(body.refreshToken, 400, "REFRESH_TOKEN_REQUIRED", "缺少 refreshToken");
    const token = data.refreshTokens.find((item) => item.tokenHash === hashToken(body.refreshToken) && !item.revokedAt);
    assert(token && Date.parse(token.expiresAt) > Date.now(), 401, "REFRESH_TOKEN_EXPIRED", "刷新令牌已失效");
    token.revokedAt = now();
    return issueTokens(data, token.userId);
  }));

  add("POST", "/v1/auth/logout", { auth: true }, async ({ request, user }) => store.update((data) => {
    const tokenHash = hashToken(bearerToken(request.headers));
    data.sessions = data.sessions.filter((item) => item.tokenHash !== tokenHash);
    data.refreshTokens.filter((item) => item.userId === user.id && !item.revokedAt).forEach((item) => { item.revokedAt = now(); });
    return { loggedOut: true };
  }));

  add("GET", "/v1/me", { auth: true }, ({ user }) => publicUser(user));
  add("PATCH", "/v1/me", { auth: true }, async ({ body, user }) => store.update((data) => {
    const current = data.users.find((item) => item.id === user.id);
    if (body.nickname !== undefined) current.nickname = String(body.nickname).trim().slice(0, 40);
    if (body.avatarUrl !== undefined) current.avatarUrl = body.avatarUrl || null;
    if (body.locale !== undefined) current.locale = String(body.locale).slice(0, 20);
    current.updatedAt = now();
    return publicUser(current);
  }));

  add("POST", "/v1/me/phone", { auth: true }, async ({ body, user }) => store.update((data) => {
    assert(body.phoneCode || body.phone, 400, "PHONE_CODE_REQUIRED", "缺少手机号授权 code");
    assert(config.authMode === "mock" || body.phoneCode, 400, "PHONE_CODE_REQUIRED", "真实模式必须传 phoneCode");
    const current = data.users.find((item) => item.id === user.id);
    current.phone = config.authMode === "mock" ? (body.phone || "13800000000") : null;
    current.updatedAt = now();
    return publicUser(current);
  }));

  add("GET", "/v1/membership", { auth: true }, ({ user }) => store.read((data) => ({ membership: data.memberships.find((item) => item.userId === user.id) || null, benefits: ["会员价", "茶分", "专属券", "茶会优先席位"] })));
  add("POST", "/v1/membership/join", { auth: true }, async ({ user }) => store.update((data) => {
    let membership = data.memberships.find((item) => item.userId === user.id);
    if (membership) return { membership, alreadyMember: true };
    membership = { id: newId("mem"), userId: user.id, level: 1, tier: "山席会员", points: 100, joinedAt: now(), updatedAt: now() };
    data.memberships.push(membership);
    data.pointsLedger.push({ id: newId("pt"), userId: user.id, amount: 100, type: "join_bonus", note: "入会茶分", createdAt: now() });
    if (!data.userCoupons.some((item) => item.userId === user.id && item.couponId === "coupon-new-30")) data.userCoupons.push({ id: newId("ucp"), userId: user.id, couponId: "coupon-new-30", status: "available", claimedAt: now(), usedAt: null, orderId: null });
    return { membership, gift: { points: 100, couponId: "coupon-new-30" }, alreadyMember: false };
  }));

  add("GET", "/v1/points/ledger", { auth: true }, ({ query, user }) => {
    const items = store.read((data) => data.pointsLedger.filter((item) => item.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    return paginate(items, query);
  });

  add("GET", "/v1/coupons", { auth: true }, ({ query, user }) => store.read((data) => {
    const status = query.get("status");
    const owned = data.userCoupons.filter((item) => item.userId === user.id && (!status || item.status === status)).map((item) => ({ ...item, coupon: data.coupons.find((coupon) => coupon.id === item.couponId) }));
    const claimable = data.coupons.filter((coupon) => coupon.claimable && !data.userCoupons.some((item) => item.userId === user.id && item.couponId === coupon.id));
    return { owned, claimable };
  }));

  add("POST", "/v1/coupons/:id/claim", { auth: true }, async ({ params, user }) => store.update((data) => {
    const coupon = data.coupons.find((item) => item.id === params.id && item.claimable);
    assert(coupon, 404, "COUPON_NOT_FOUND", "优惠券不存在");
    if (coupon.memberOnly) assert(data.memberships.some((item) => item.userId === user.id), 403, "MEMBERSHIP_REQUIRED", "该优惠券仅限会员领取");
    assert(!data.userCoupons.some((item) => item.userId === user.id && item.couponId === coupon.id), 409, "COUPON_ALREADY_CLAIMED", "已领取该优惠券");
    const owned = { id: newId("ucp"), userId: user.id, couponId: coupon.id, status: "available", claimedAt: now(), usedAt: null, orderId: null };
    data.userCoupons.push(owned);
    return { ...owned, coupon };
  }));

  add("GET", "/v1/catalog/categories", () => store.read((data) => data.categories.filter((item) => item.enabled).sort((a, b) => a.sort - b.sort)));
  add("GET", "/v1/catalog/products", ({ query }) => store.read((data) => {
    const categoryId = query.get("categoryId");
    const keyword = (query.get("q") || "").trim().toLowerCase();
    const tag = query.get("tag");
    const crossBorder = query.get("crossBorder");
    let items = data.products.filter((item) => item.status === "active");
    if (categoryId) items = items.filter((item) => item.categoryId === categoryId);
    if (keyword) items = items.filter((item) => `${item.name}${item.summary}${item.subcategory}`.toLowerCase().includes(keyword));
    if (tag) items = items.filter((item) => item.tag === tag);
    if (crossBorder !== null) items = items.filter((item) => item.crossBorder === (crossBorder === "true"));
    const result = paginate(items.map(presentProduct), query);
    return result;
  }));
  add("GET", "/v1/catalog/products/:id", ({ params }) => store.read((data) => {
    const product = data.products.find((item) => item.id === params.id && item.status !== "deleted");
    assert(product, 404, "PRODUCT_NOT_FOUND", "商品不存在");
    return { ...presentProduct(product), trace: data.traceBatches.find((item) => item.id === product.traceBatchId) || null };
  }));
  add("GET", "/v1/trace/:batchId", ({ params }) => store.read((data) => {
    const batch = data.traceBatches.find((item) => item.id === params.batchId);
    assert(batch, 404, "TRACE_NOT_FOUND", "溯源批次不存在");
    return { ...batch, products: data.products.filter((item) => item.traceBatchId === batch.id).map((item) => ({ id: item.id, name: item.name, sku: item.sku })) };
  }));

  add("GET", "/v1/promotions", ({ query }) => store.read((data) => data.promotions.filter((item) => (!query.get("kind") || item.kind === query.get("kind")) && (!query.get("status") || item.status === query.get("status"))).map((item) => ({ ...item, product: presentProduct(data.products.find((product) => product.id === item.productId)) }))));
  add("GET", "/v1/promotions/:id", ({ params }) => store.read((data) => {
    const promotion = data.promotions.find((item) => item.id === params.id);
    assert(promotion, 404, "PROMOTION_NOT_FOUND", "活动不存在");
    return { ...promotion, product: presentProduct(data.products.find((item) => item.id === promotion.productId)) };
  }));

  add("POST", "/v1/promotions/:id/reserve", { auth: true }, async ({ params, user }) => store.update((data) => {
    const promotion = data.promotions.find((item) => item.id === params.id && item.kind === "flash_sale" && item.status === "active");
    assert(promotion, 404, "FLASH_SALE_NOT_FOUND", "秒杀活动不存在");
    assert(promotion.stock > 0, 409, "PROMOTION_SOLD_OUT", "活动库存已售罄");
    assert(!data.reservations.some((item) => item.userId === user.id && item.promotionId === promotion.id && item.status === "active"), 409, "ALREADY_RESERVED", "已获得秒杀资格");
    const reservation = { id: newId("rsv"), userId: user.id, promotionId: promotion.id, status: "active", expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), createdAt: now() };
    data.reservations.push(reservation);
    promotion.stock -= 1;
    return reservation;
  }));

  add("GET", "/v1/cart", { auth: true }, ({ user }) => store.read((data) => cartView(data, user.id)));
  add("POST", "/v1/cart/items", { auth: true }, async ({ body, user }) => store.update((data) => {
    const product = data.products.find((item) => item.id === body.productId && item.status === "active");
    assert(product, 404, "PRODUCT_NOT_FOUND", "商品不存在");
    const quantity = positiveInteger(body.quantity ?? 1);
    const cart = getCart(data, user.id);
    const item = cart.items.find((entry) => entry.productId === product.id);
    const next = (item?.quantity || 0) + quantity;
    assert(next <= product.stock, 409, "OUT_OF_STOCK", "库存不足");
    if (item) item.quantity = next;
    else cart.items.push({ productId: product.id, quantity });
    cart.updatedAt = now();
    return cartView(data, user.id);
  }));
  add("PATCH", "/v1/cart/items/:productId", { auth: true }, async ({ params, body, user }) => store.update((data) => {
    const quantity = positiveInteger(body.quantity);
    const product = data.products.find((item) => item.id === params.productId && item.status === "active");
    assert(product, 404, "PRODUCT_NOT_FOUND", "商品不存在");
    assert(quantity <= product.stock, 409, "OUT_OF_STOCK", "库存不足");
    const cart = getCart(data, user.id);
    const item = cart.items.find((entry) => entry.productId === product.id);
    assert(item, 404, "CART_ITEM_NOT_FOUND", "购物车中没有该商品");
    item.quantity = quantity;
    cart.updatedAt = now();
    return cartView(data, user.id);
  }));
  add("DELETE", "/v1/cart/items/:productId", { auth: true }, async ({ params, user }) => store.update((data) => {
    const cart = getCart(data, user.id);
    cart.items = cart.items.filter((item) => item.productId !== params.productId);
    cart.updatedAt = now();
    return cartView(data, user.id);
  }));
  add("DELETE", "/v1/cart", { auth: true }, async ({ user }) => store.update((data) => {
    const cart = getCart(data, user.id);
    cart.items = [];
    cart.updatedAt = now();
    return cartView(data, user.id);
  }));
  add("POST", "/v1/cart/quote", { auth: true }, ({ body, user }) => store.read((data) => quoteCart(data, user.id, body)));

  add("GET", "/v1/addresses", { auth: true }, ({ user }) => store.read((data) => data.addresses.filter((item) => item.userId === user.id)));
  add("POST", "/v1/addresses", { auth: true }, async ({ body, user }) => store.update((data) => {
    for (const field of ["name", "phone", "countryCode", "line1", "city"]) assert(body[field], 400, "ADDRESS_FIELD_REQUIRED", `缺少地址字段 ${field}`);
    if (body.isDefault) data.addresses.filter((item) => item.userId === user.id).forEach((item) => { item.isDefault = false; });
    const address = { id: newId("adr"), userId: user.id, name: body.name, phone: body.phone, countryCode: body.countryCode, province: body.province || "", city: body.city, district: body.district || "", line1: body.line1, postalCode: body.postalCode || "", customsId: body.customsId || null, isDefault: Boolean(body.isDefault) || !data.addresses.some((item) => item.userId === user.id), createdAt: now(), updatedAt: now() };
    data.addresses.push(address);
    return address;
  }));
  add("PATCH", "/v1/addresses/:id", { auth: true }, async ({ params, body, user }) => store.update((data) => {
    const address = data.addresses.find((item) => item.id === params.id && item.userId === user.id);
    assert(address, 404, "ADDRESS_NOT_FOUND", "地址不存在");
    if (body.isDefault) data.addresses.filter((item) => item.userId === user.id).forEach((item) => { item.isDefault = false; });
    for (const field of ["name", "phone", "countryCode", "province", "city", "district", "line1", "postalCode", "customsId", "isDefault"]) if (body[field] !== undefined) address[field] = body[field];
    address.updatedAt = now();
    return address;
  }));
  add("DELETE", "/v1/addresses/:id", { auth: true }, async ({ params, user }) => store.update((data) => {
    const index = data.addresses.findIndex((item) => item.id === params.id && item.userId === user.id);
    assert(index >= 0, 404, "ADDRESS_NOT_FOUND", "地址不存在");
    const [removed] = data.addresses.splice(index, 1);
    if (removed.isDefault && data.addresses.find((item) => item.userId === user.id)) data.addresses.find((item) => item.userId === user.id).isDefault = true;
    return { deleted: true };
  }));

  add("GET", "/v1/shipping/countries", () => store.read((data) => data.shippingCountries));
  add("POST", "/v1/shipping/quote", ({ body }) => store.read((data) => shippingQuote(data, { countryCode: body.countryCode, weightGrams: positiveInteger(body.weightGrams || 500, "weightGrams", 100000), subtotal: amount(body.subtotal || 0, "subtotal") })));

  add("POST", "/v1/orders", { auth: true }, async ({ body, request, user }) => store.update((data) => {
    const idempotencyKey = request.headers["idempotency-key"];
    assert(idempotencyKey, 400, "IDEMPOTENCY_KEY_REQUIRED", "创建订单必须提供 Idempotency-Key");
    const existing = data.orders.find((item) => item.userId === user.id && item.idempotencyKey === idempotencyKey);
    if (existing) return existing;
    const address = data.addresses.find((item) => item.id === body.addressId && item.userId === user.id);
    assert(address, 400, "ADDRESS_REQUIRED", "请选择收货地址");
    const quote = quoteCart(data, user.id, { couponId: body.couponId, countryCode: address.countryCode });
    const order = {
      id: newId("ord"), orderNo: `YT${Date.now()}${Math.floor(Math.random() * 900 + 100)}`, userId: user.id, idempotencyKey,
      status: "pending_payment", fulfillment: address.countryCode === "CN" ? "domestic" : "cross_border", address: structuredClone(address),
      items: quote.cart.items.map((item) => ({ productId: item.product.id, sku: item.product.sku, name: item.product.name, image: item.product.image, unitPrice: item.product.price, quantity: item.quantity, lineTotal: item.lineTotal })),
      subtotal: quote.subtotal, discount: quote.discount, shippingFee: quote.shippingFee, total: quote.total, currency: quote.currency, couponId: quote.coupon?.id || null,
      note: String(body.note || "").slice(0, 200), customs: address.countryCode === "CN" ? null : { required: true, declarationStatus: address.customsId ? "ready" : "missing_id" },
      tracking: null, createdAt: now(), updatedAt: now(), paidAt: null,
    };
    data.orders.push(order);
    const cart = getCart(data, user.id);
    cart.items = [];
    cart.updatedAt = now();
    return order;
  }));
  add("GET", "/v1/orders", { auth: true }, ({ query, user }) => store.read((data) => {
    let items = data.orders.filter((item) => item.userId === user.id);
    if (query.get("status")) items = items.filter((item) => item.status === query.get("status"));
    return paginate(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), query);
  }));
  add("GET", "/v1/orders/:id", { auth: true }, ({ params, user }) => store.read((data) => ownedOrder(data, user.id, params.id)));
  add("POST", "/v1/orders/:id/cancel", { auth: true }, async ({ params, body, user }) => store.update((data) => {
    const order = ownedOrder(data, user.id, params.id);
    assert(["pending_payment", "paid"].includes(order.status), 409, "ORDER_NOT_CANCELLABLE", "当前订单不可取消");
    order.status = order.status === "paid" ? "refund_pending" : "cancelled";
    order.cancelReason = String(body.reason || "用户取消").slice(0, 100);
    order.updatedAt = now();
    return order;
  }));
  add("POST", "/v1/orders/:id/confirm-receipt", { auth: true }, async ({ params, user }) => store.update((data) => {
    const order = ownedOrder(data, user.id, params.id);
    assert(order.status === "shipped", 409, "ORDER_NOT_RECEIVABLE", "订单尚未发货");
    order.status = "completed";
    order.completedAt = now();
    order.updatedAt = now();
    return order;
  }));
  add("GET", "/v1/orders/:id/tracking", { auth: true }, ({ params, user }) => store.read((data) => {
    const order = ownedOrder(data, user.id, params.id);
    return order.tracking || { status: "not_shipped", events: [] };
  }));

  add("POST", "/v1/payments", { auth: true }, async ({ body, user }) => store.update((data) => {
    const order = ownedOrder(data, user.id, body.orderId);
    assert(order.status === "pending_payment", 409, "ORDER_NOT_PAYABLE", "当前订单不可支付");
    let payment = data.payments.find((item) => item.orderId === order.id && item.status === "pending");
    if (!payment) {
      payment = { id: newId("pay"), orderId: order.id, userId: user.id, amount: order.total, currency: order.currency, provider: "wechat_pay", status: "pending", prepayId: config.authMode === "mock" ? `mock_${randomUUID()}` : null, transactionId: null, createdAt: now(), paidAt: null };
      data.payments.push(payment);
    }
    return { payment, jsapi: config.authMode === "mock" ? { timeStamp: String(Math.floor(Date.now() / 1000)), nonceStr: newToken("nonce"), package: `prepay_id=${payment.prepayId}`, signType: "RSA", paySign: "MOCK_SIGNATURE" } : null };
  }));
  add("POST", "/v1/payments/:id/mock-confirm", { auth: true }, async ({ params, user }) => store.update((data) => {
    assert(config.authMode === "mock", 404, "NOT_FOUND", "该接口仅在 mock 模式可用");
    const payment = data.payments.find((item) => item.id === params.id && item.userId === user.id);
    assert(payment, 404, "PAYMENT_NOT_FOUND", "支付单不存在");
    return completePayment(data, payment, `mock_tx_${Date.now()}`);
  }));
  add("POST", "/v1/payments/wechat-notify", async ({ body, request }) => store.update((data) => {
    assert(config.authMode === "mock" ? request.headers["x-wechat-mock-signature"] === "valid" : request.headers["wechatpay-signature"], 401, "INVALID_WECHAT_SIGNATURE", "微信支付签名校验失败");
    const payment = data.payments.find((item) => item.id === body.paymentId || item.prepayId === body.prepayId);
    assert(payment, 404, "PAYMENT_NOT_FOUND", "支付单不存在");
    completePayment(data, payment, body.transactionId || `wx_${Date.now()}`);
    return { code: "SUCCESS", message: "成功" };
  }));

  add("POST", "/v1/groups", { auth: true }, async ({ body, user }) => store.update((data) => {
    const promotion = data.promotions.find((item) => item.id === body.promotionId && item.kind === "group_buy" && item.status === "active");
    assert(promotion, 404, "GROUP_PROMOTION_NOT_FOUND", "拼团活动不存在");
    const group = { id: newId("grp"), promotionId: promotion.id, ownerUserId: user.id, members: [{ userId: user.id, joinedAt: now() }], requiredPeople: promotion.requiredPeople, status: "forming", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), createdAt: now() };
    data.groups.push(group);
    return group;
  }));
  add("GET", "/v1/groups/:id", ({ params }) => store.read((data) => {
    const group = data.groups.find((item) => item.id === params.id);
    assert(group, 404, "GROUP_NOT_FOUND", "拼团不存在");
    return { ...group, remainingPeople: Math.max(0, group.requiredPeople - group.members.length) };
  }));
  add("POST", "/v1/groups/:id/join", { auth: true }, async ({ params, user }) => store.update((data) => {
    const group = data.groups.find((item) => item.id === params.id);
    assert(group && group.status === "forming" && Date.parse(group.expiresAt) > Date.now(), 409, "GROUP_NOT_JOINABLE", "拼团不可加入");
    assert(!group.members.some((item) => item.userId === user.id), 409, "GROUP_ALREADY_JOINED", "已加入该拼团");
    group.members.push({ userId: user.id, joinedAt: now() });
    if (group.members.length >= group.requiredPeople) {
      group.status = "formed";
      group.formedAt = now();
    }
    return { ...group, remainingPeople: Math.max(0, group.requiredPeople - group.members.length) };
  }));

  add("GET", "/v1/events", ({ query }) => store.read((data) => paginate(data.events.filter((item) => !query.get("type") || item.type === query.get("type")).sort((a, b) => a.startsAt.localeCompare(b.startsAt)), query)));
  add("GET", "/v1/events/:id", ({ params }) => store.read((data) => {
    const event = data.events.find((item) => item.id === params.id);
    assert(event, 404, "EVENT_NOT_FOUND", "茶会不存在");
    return event;
  }));
  add("POST", "/v1/events/:id/reserve", { auth: true }, async ({ params, user }) => store.update((data) => {
    const event = data.events.find((item) => item.id === params.id);
    assert(event, 404, "EVENT_NOT_FOUND", "茶会不存在");
    assert(event.reservedCount < event.capacity, 409, "EVENT_FULL", "茶会已满员");
    let reservation = data.reservations.find((item) => item.userId === user.id && item.eventId === event.id);
    if (reservation) return { ...reservation, alreadyReserved: true };
    reservation = { id: newId("evt_rsv"), userId: user.id, eventId: event.id, status: "confirmed", createdAt: now() };
    data.reservations.push(reservation);
    event.reservedCount += 1;
    return { ...reservation, alreadyReserved: false };
  }));

  add("GET", "/v1/communities", () => store.read((data) => data.communities));
  add("POST", "/v1/communities/:id/join", { auth: true }, async ({ params, user }) => store.update((data) => {
    const community = data.communities.find((item) => item.id === params.id && item.status === "active");
    assert(community, 404, "COMMUNITY_NOT_FOUND", "社群不存在");
    let member = data.communityMembers.find((item) => item.userId === user.id && item.communityId === community.id);
    if (!member) {
      member = { id: newId("cmm"), userId: user.id, communityId: community.id, status: "joined", joinedAt: now() };
      data.communityMembers.push(member);
      community.memberCount += 1;
    }
    return { membership: member, joinPayload: { mode: community.joinMode, contactHint: "企业微信活码需由运营后台配置" } };
  }));

  add("GET", "/v1/content", ({ query }) => store.read((data) => paginate(data.content.filter((item) => item.status === "published" && (!query.get("type") || item.type === query.get("type"))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), query)));
  add("GET", "/v1/content/:id", ({ params }) => store.read((data) => {
    const content = data.content.find((item) => item.id === params.id && item.status === "published");
    assert(content, 404, "CONTENT_NOT_FOUND", "内容不存在");
    return content;
  }));
  add("GET", "/v1/collaborations", () => store.read((data) => data.collaborations.filter((item) => item.status === "active")));

  add("GET", "/v1/favorites", { auth: true }, ({ user }) => store.read((data) => data.favorites.filter((item) => item.userId === user.id).map((item) => ({ ...item, product: presentProduct(data.products.find((product) => product.id === item.productId)) }))));
  add("PUT", "/v1/favorites/:productId", { auth: true }, async ({ params, user }) => store.update((data) => {
    assert(data.products.some((item) => item.id === params.productId && item.status === "active"), 404, "PRODUCT_NOT_FOUND", "商品不存在");
    let favorite = data.favorites.find((item) => item.userId === user.id && item.productId === params.productId);
    if (!favorite) {
      favorite = { id: newId("fav"), userId: user.id, productId: params.productId, createdAt: now() };
      data.favorites.push(favorite);
    }
    return favorite;
  }));
  add("DELETE", "/v1/favorites/:productId", { auth: true }, async ({ params, user }) => store.update((data) => {
    data.favorites = data.favorites.filter((item) => !(item.userId === user.id && item.productId === params.productId));
    return { deleted: true };
  }));

  add("GET", "/v1/products/:productId/reviews", ({ params, query }) => store.read((data) => paginate(data.reviews.filter((item) => item.productId === params.productId && item.status === "published"), query)));
  add("POST", "/v1/products/:productId/reviews", { auth: true }, async ({ params, body, user }) => store.update((data) => {
    const rating = positiveInteger(body.rating, "rating", 5);
    const hasPurchase = data.orders.some((order) => order.userId === user.id && ["paid", "shipped", "completed"].includes(order.status) && order.items.some((item) => item.productId === params.productId));
    assert(hasPurchase, 403, "PURCHASE_REQUIRED", "购买后才能评价");
    assert(!data.reviews.some((item) => item.userId === user.id && item.productId === params.productId), 409, "REVIEW_EXISTS", "已评价该商品");
    const review = { id: newId("rvw"), userId: user.id, productId: params.productId, rating, content: String(body.content || "").slice(0, 500), images: Array.isArray(body.images) ? body.images.slice(0, 6) : [], status: "published", createdAt: now() };
    data.reviews.push(review);
    return review;
  }));

  add("GET", "/v1/notifications", { auth: true }, ({ query, user }) => store.read((data) => paginate(data.notifications.filter((item) => item.userId === user.id && (query.get("read") === null || Boolean(item.readAt) === (query.get("read") === "true"))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), query)));
  add("POST", "/v1/notifications/:id/read", { auth: true }, async ({ params, user }) => store.update((data) => {
    const notification = data.notifications.find((item) => item.id === params.id && item.userId === user.id);
    assert(notification, 404, "NOTIFICATION_NOT_FOUND", "通知不存在");
    notification.readAt = notification.readAt || now();
    return notification;
  }));

  add("POST", "/v1/admin/products", { admin: true }, async ({ body }) => store.update((data) => {
    for (const field of ["name", "categoryId", "price", "stock"]) assert(body[field] !== undefined, 400, "PRODUCT_FIELD_REQUIRED", `缺少商品字段 ${field}`);
    assert(data.categories.some((item) => item.id === body.categoryId), 400, "CATEGORY_NOT_FOUND", "分类不存在");
    const product = { id: body.id || newId("prd"), sku: body.sku || `YTEA-${Date.now()}`, categoryId: body.categoryId, name: body.name, summary: body.summary || "", description: body.description || "", size: body.size || "", price: amount(body.price, "price"), currency: "CNY", image: body.image || null, images: body.images || [], subcategory: body.subcategory || "", tag: body.tag || null, stock: amount(body.stock, "stock"), status: body.status || "draft", crossBorder: Boolean(body.crossBorder), traceBatchId: body.traceBatchId || null, createdAt: now(), updatedAt: now() };
    data.products.push(product);
    return product;
  }));
  add("PATCH", "/v1/admin/products/:id", { admin: true }, async ({ params, body }) => store.update((data) => {
    const product = data.products.find((item) => item.id === params.id);
    assert(product, 404, "PRODUCT_NOT_FOUND", "商品不存在");
    for (const field of ["name", "summary", "description", "size", "categoryId", "price", "image", "images", "subcategory", "tag", "stock", "status", "crossBorder", "traceBatchId"]) if (body[field] !== undefined) product[field] = ["price", "stock"].includes(field) ? amount(body[field], field) : body[field];
    product.updatedAt = now();
    return product;
  }));
  add("PATCH", "/v1/admin/orders/:id/status", { admin: true }, async ({ params, body }) => store.update((data) => {
    const order = data.orders.find((item) => item.id === params.id);
    assert(order, 404, "ORDER_NOT_FOUND", "订单不存在");
    const allowed = ["paid", "packing", "shipped", "completed", "refund_pending", "refunded"];
    assert(allowed.includes(body.status), 400, "INVALID_ORDER_STATUS", "订单状态不合法");
    order.status = body.status;
    order.updatedAt = now();
    if (body.status === "shipped") order.tracking = { carrier: body.carrier || "SF", trackingNo: body.trackingNo || `YT${Date.now()}`, status: "in_transit", events: [{ time: now(), description: "茶品已发出" }] };
    return order;
  }));
  add("POST", "/v1/admin/content", { admin: true }, async ({ body }) => store.update((data) => {
    for (const field of ["type", "title"]) assert(body[field], 400, "CONTENT_FIELD_REQUIRED", `缺少内容字段 ${field}`);
    const content = { id: body.id || newId("cnt"), type: body.type, title: body.title, summary: body.summary || "", body: body.body || "", image: body.image || null, publishedAt: body.publishedAt || now(), status: body.status || "draft" };
    data.content.push(content);
    return content;
  }));
  add("POST", "/v1/admin/promotions", { admin: true }, async ({ body }) => store.update((data) => {
    assert(["group_buy", "flash_sale", "coupon"].includes(body.kind), 400, "INVALID_PROMOTION_KIND", "活动类型不合法");
    const promotion = { id: body.id || newId("pro"), ...body, stock: amount(body.stock || 0, "stock"), status: body.status || "draft", createdAt: now() };
    data.promotions.push(promotion);
    return promotion;
  }));
  add("POST", "/v1/admin/events", { admin: true }, async ({ body }) => store.update((data) => {
    for (const field of ["type", "title", "startsAt", "endsAt", "capacity"]) assert(body[field] !== undefined, 400, "EVENT_FIELD_REQUIRED", `缺少茶会字段 ${field}`);
    const event = { id: body.id || newId("evt"), type: body.type, title: body.title, summary: body.summary || "", startsAt: body.startsAt, endsAt: body.endsAt, capacity: positiveInteger(body.capacity, "capacity", 100000), reservedCount: 0, streamStatus: body.streamStatus || "scheduled", cover: body.cover || null };
    data.events.push(event);
    return event;
  }));
  add("GET", "/v1/admin/overview", { admin: true }, () => store.read((data) => ({ users: data.users.length, members: data.memberships.length, orders: data.orders.length, paidRevenue: data.orders.filter((item) => ["paid", "packing", "shipped", "completed"].includes(item.status)).reduce((sum, item) => sum + item.total, 0), lowStockProducts: data.products.filter((item) => item.stock < 20).map((item) => ({ id: item.id, name: item.name, stock: item.stock })) })));

  const handler = async (request, response) => {
    const requestId = request.headers["x-request-id"] || randomUUID();
    const requestUrl = new URL(request.url, config.publicBaseUrl);
    const origin = request.headers.origin;
    const cors = origin && config.allowedOrigins.includes(origin) ? { "access-control-allow-origin": origin, "vary": "origin" } : {};
    if (request.method === "OPTIONS") {
      response.writeHead(204, { ...cors, "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "authorization,content-type,idempotency-key,x-admin-key,x-request-id,x-wechat-mock-signature", "access-control-max-age": "600" });
      response.end();
      return;
    }
    try {
      const route = routes.find((item) => item.method === request.method && item.regex.test(requestUrl.pathname));
      assert(route, 404, "ROUTE_NOT_FOUND", "接口不存在");
      const match = route.regex.exec(requestUrl.pathname);
      const params = Object.fromEntries(route.names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
      const body = await readBody(request);
      const user = route.options.auth ? authenticate(store, request.headers) : null;
      if (route.options.admin) requireAdmin(request.headers, config.adminApiKey);
      const result = await route.handler({ request, response, params, query: requestUrl.searchParams, body, user, requestId });
      send(response, request.method === "POST" ? 201 : 200, { data: result, requestId }, requestId, cors);
    } catch (error) {
      const failure = error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR", "服务器内部错误");
      if (!(error instanceof ApiError)) console.error(`[${requestId}]`, error);
      send(response, failure.status, { error: { code: failure.code, message: failure.message, ...(failure.details === undefined ? {} : { details: failure.details }) }, requestId }, requestId, cors);
    }
  };

  handler.routes = routes.map(({ method, pattern, options }) => ({ method, pattern, auth: Boolean(options.auth), admin: Boolean(options.admin) }));
  return handler;
}
