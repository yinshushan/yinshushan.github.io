import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { createApi } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { documentedOperationCount } from "../src/openapi.js";
import { seedData } from "../src/seed.js";
import { JsonStore } from "../src/store.js";

async function fixture() {
  const config = loadConfig({ PORT: "0", DATA_FILE: ":memory:", AUTH_MODE: "mock", ADMIN_API_KEY: "test-admin", ALLOWED_ORIGINS: "http://localhost:4173" });
  const store = await new JsonStore({ file: null, seed: seedData }).init();
  const api = createApi({ config, store });
  const server = http.createServer(api);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function request(method, path, { token, adminKey, body, headers = {} } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(adminKey ? { "x-admin-key": adminKey } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json();
    return { status: response.status, payload, headers: response.headers };
  }

  async function login(code = "primary-user") {
    const result = await request("POST", "/v1/auth/wechat-login", { body: { code, userProfile: { nickname: "山席茶友" } } });
    assert.equal(result.status, 201);
    return result.payload.data;
  }

  return { api, baseUrl, config, login, request, server, store, close: () => new Promise((resolve) => server.close(resolve)) };
}

test("health and OpenAPI expose the complete service contract", async (t) => {
  const app = await fixture();
  t.after(app.close);
  const health = await app.request("GET", "/health");
  assert.equal(health.status, 200);
  assert.equal(health.payload.data.status, "ok");
  assert.ok(app.api.routes.length >= 60);

  const spec = await app.request("GET", "/openapi.json");
  assert.equal(spec.status, 200);
  assert.equal(spec.payload.data.openapi, "3.1.0");
  const operations = Object.values(spec.payload.data.paths).reduce((sum, path) => sum + Object.keys(path).length, 0);
  assert.equal(operations, documentedOperationCount);
  assert.ok(operations >= 60);
});

test("authentication, membership, points and coupons form one working flow", async (t) => {
  const app = await fixture();
  t.after(app.close);
  const session = await app.login();

  const profile = await app.request("GET", "/v1/me", { token: session.accessToken });
  assert.equal(profile.status, 200);
  assert.equal(profile.payload.data.nickname, "山席茶友");

  const joined = await app.request("POST", "/v1/membership/join", { token: session.accessToken, body: {} });
  assert.equal(joined.status, 201);
  assert.equal(joined.payload.data.membership.points, 100);
  assert.equal(joined.payload.data.gift.couponId, "coupon-new-30");

  const coupons = await app.request("GET", "/v1/coupons?status=available", { token: session.accessToken });
  assert.equal(coupons.payload.data.owned.length, 1);
  assert.equal(coupons.payload.data.owned[0].coupon.discount, 3000);

  const ledger = await app.request("GET", "/v1/points/ledger", { token: session.accessToken });
  assert.equal(ledger.payload.data.items[0].type, "join_bonus");

  const refreshed = await app.request("POST", "/v1/auth/refresh", { body: { refreshToken: session.refreshToken } });
  assert.equal(refreshed.status, 201);
  assert.notEqual(refreshed.payload.data.accessToken, session.accessToken);
});

test("cart quote, idempotent order, payment, points and tracking work end to end", async (t) => {
  const app = await fixture();
  t.after(app.close);
  const session = await app.login();
  const token = session.accessToken;
  await app.request("POST", "/v1/membership/join", { token, body: {} });

  const productBefore = await app.request("GET", "/v1/catalog/products/white-2017-forest");
  assert.equal(productBefore.payload.data.price, 68000);
  const initialStock = productBefore.payload.data.stock;

  const added = await app.request("POST", "/v1/cart/items", { token, body: { productId: "white-2017-forest", quantity: 1 } });
  assert.equal(added.payload.data.itemCount, 1);
  assert.equal(added.payload.data.subtotal, 68000);

  const quote = await app.request("POST", "/v1/cart/quote", { token, body: { couponId: "coupon-new-30", countryCode: "CN" } });
  assert.equal(quote.payload.data.discount, 3000);
  assert.equal(quote.payload.data.shippingFee, 0);
  assert.equal(quote.payload.data.total, 65000);

  const address = await app.request("POST", "/v1/addresses", { token, body: { name: "茶友", phone: "13800000000", countryCode: "CN", city: "上海", line1: "茶席路 1 号", isDefault: true } });
  assert.equal(address.status, 201);

  const orderHeaders = { "idempotency-key": "checkout-test-1" };
  const created = await app.request("POST", "/v1/orders", { token, headers: orderHeaders, body: { addressId: address.payload.data.id, couponId: "coupon-new-30" } });
  assert.equal(created.status, 201);
  assert.equal(created.payload.data.total, 65000);
  assert.equal(created.payload.data.status, "pending_payment");

  const repeated = await app.request("POST", "/v1/orders", { token, headers: orderHeaders, body: { addressId: address.payload.data.id, couponId: "coupon-new-30" } });
  assert.equal(repeated.payload.data.id, created.payload.data.id);

  const payment = await app.request("POST", "/v1/payments", { token, body: { orderId: created.payload.data.id } });
  assert.equal(payment.payload.data.payment.amount, 65000);
  assert.equal(payment.payload.data.jsapi.signType, "RSA");

  const confirmed = await app.request("POST", `/v1/payments/${payment.payload.data.payment.id}/mock-confirm`, { token, body: {} });
  assert.equal(confirmed.payload.data.status, "paid");

  const order = await app.request("GET", `/v1/orders/${created.payload.data.id}`, { token });
  assert.equal(order.payload.data.status, "paid");

  const productAfter = await app.request("GET", "/v1/catalog/products/white-2017-forest");
  assert.equal(productAfter.payload.data.stock, initialStock - 1);

  const member = await app.request("GET", "/v1/membership", { token });
  assert.equal(member.payload.data.membership.points, 750);

  const shipped = await app.request("PATCH", `/v1/admin/orders/${created.payload.data.id}/status`, { adminKey: "test-admin", body: { status: "shipped", carrier: "SF", trackingNo: "SF123" } });
  assert.equal(shipped.payload.data.tracking.trackingNo, "SF123");
  const tracking = await app.request("GET", `/v1/orders/${created.payload.data.id}/tracking`, { token });
  assert.equal(tracking.payload.data.status, "in_transit");

  const receipt = await app.request("POST", `/v1/orders/${created.payload.data.id}/confirm-receipt`, { token, body: {} });
  assert.equal(receipt.payload.data.status, "completed");
});

test("cross-border, promotion, tea gathering, community, content and traceability endpoints work", async (t) => {
  const app = await fixture();
  t.after(app.close);
  const first = await app.login("group-owner");
  const second = await app.login("group-friend");

  const shipping = await app.request("POST", "/v1/shipping/quote", { body: { countryCode: "GB", weightGrams: 900, subtotal: 40000 } });
  assert.equal(shipping.payload.data.customsRequired, true);
  assert.equal(shipping.payload.data.fee, 18000);

  const group = await app.request("POST", "/v1/groups", { token: first.accessToken, body: { promotionId: "promo-group-white" } });
  assert.equal(group.payload.data.status, "forming");
  const joined = await app.request("POST", `/v1/groups/${group.payload.data.id}/join`, { token: second.accessToken, body: {} });
  assert.equal(joined.payload.data.remainingPeople, 1);

  const flash = await app.request("POST", "/v1/promotions/promo-flash-green/reserve", { token: first.accessToken, body: {} });
  assert.equal(flash.payload.data.status, "active");

  const event = await app.request("POST", "/v1/events/event-live-jingmai/reserve", { token: first.accessToken, body: {} });
  assert.equal(event.payload.data.status, "confirmed");

  const community = await app.request("POST", "/v1/communities/community-jingmai/join", { token: first.accessToken, body: {} });
  assert.equal(community.payload.data.membership.status, "joined");

  const content = await app.request("GET", "/v1/content?type=education");
  assert.equal(content.payload.data.items[0].id, "article-tea-sleep");
  const trace = await app.request("GET", "/v1/trace/YM260318");
  assert.equal(trace.payload.data.status, "verified");
  assert.ok(trace.payload.data.products.length > 0);
});

test("protected endpoints reject missing credentials and admin routes reject bad keys", async (t) => {
  const app = await fixture();
  t.after(app.close);
  const cart = await app.request("GET", "/v1/cart");
  assert.equal(cart.status, 401);
  assert.equal(cart.payload.error.code, "AUTH_REQUIRED");

  const admin = await app.request("GET", "/v1/admin/overview", { adminKey: "wrong" });
  assert.equal(admin.status, 401);
  assert.equal(admin.payload.error.code, "ADMIN_AUTH_REQUIRED");
});
