const operations = [
  ["get", "/health", "system", "健康检查", false],
  ["post", "/v1/auth/wechat-login", "auth", "微信 code 登录", false],
  ["post", "/v1/auth/refresh", "auth", "刷新令牌", false],
  ["post", "/v1/auth/logout", "auth", "退出登录", true],
  ["get", "/v1/me", "user", "获取个人资料", true],
  ["patch", "/v1/me", "user", "更新个人资料", true],
  ["post", "/v1/me/phone", "user", "绑定微信手机号", true],
  ["get", "/v1/membership", "membership", "获取会员资产", true],
  ["post", "/v1/membership/join", "membership", "入会领茶礼", true],
  ["get", "/v1/points/ledger", "membership", "茶分明细", true],
  ["get", "/v1/coupons", "promotion", "我的优惠券与可领券", true],
  ["post", "/v1/coupons/{id}/claim", "promotion", "领取优惠券", true],
  ["get", "/v1/catalog/categories", "catalog", "商品分类", false],
  ["get", "/v1/catalog/products", "catalog", "商品列表与搜索", false],
  ["get", "/v1/catalog/products/{id}", "catalog", "商品详情", false],
  ["get", "/v1/trace/{batchId}", "traceability", "产品批次溯源", false],
  ["get", "/v1/promotions", "promotion", "拼团、秒杀等活动列表", false],
  ["get", "/v1/promotions/{id}", "promotion", "活动详情", false],
  ["post", "/v1/promotions/{id}/reserve", "promotion", "锁定秒杀资格", true],
  ["get", "/v1/cart", "commerce", "购物车", true],
  ["post", "/v1/cart/items", "commerce", "加入购物车", true],
  ["patch", "/v1/cart/items/{productId}", "commerce", "修改购物车数量", true],
  ["delete", "/v1/cart/items/{productId}", "commerce", "删除购物车商品", true],
  ["delete", "/v1/cart", "commerce", "清空购物车", true],
  ["post", "/v1/cart/quote", "commerce", "计算优惠、运费和应付金额", true],
  ["get", "/v1/addresses", "commerce", "地址列表", true],
  ["post", "/v1/addresses", "commerce", "新建地址", true],
  ["patch", "/v1/addresses/{id}", "commerce", "更新地址", true],
  ["delete", "/v1/addresses/{id}", "commerce", "删除地址", true],
  ["get", "/v1/shipping/countries", "shipping", "支持的跨境国家和地区", false],
  ["post", "/v1/shipping/quote", "shipping", "单独试算运费", false],
  ["post", "/v1/orders", "commerce", "幂等创建订单", true],
  ["get", "/v1/orders", "commerce", "订单列表", true],
  ["get", "/v1/orders/{id}", "commerce", "订单详情", true],
  ["post", "/v1/orders/{id}/cancel", "commerce", "取消订单或申请退款", true],
  ["post", "/v1/orders/{id}/confirm-receipt", "commerce", "确认收货", true],
  ["get", "/v1/orders/{id}/tracking", "shipping", "物流轨迹", true],
  ["post", "/v1/payments", "payment", "创建微信支付单", true],
  ["post", "/v1/payments/{id}/mock-confirm", "payment", "本地模拟支付成功", true],
  ["post", "/v1/payments/wechat-notify", "payment", "微信支付回调", false],
  ["post", "/v1/groups", "promotion", "发起拼团", true],
  ["get", "/v1/groups/{id}", "promotion", "拼团进度", false],
  ["post", "/v1/groups/{id}/join", "promotion", "加入拼团", true],
  ["get", "/v1/events", "community", "茶会与直播列表", false],
  ["get", "/v1/events/{id}", "community", "茶会详情", false],
  ["post", "/v1/events/{id}/reserve", "community", "预约茶会", true],
  ["get", "/v1/communities", "community", "茶友社群列表", false],
  ["post", "/v1/communities/{id}/join", "community", "加入私域社群", true],
  ["get", "/v1/content", "content", "品牌故事与茶文化内容", false],
  ["get", "/v1/content/{id}", "content", "内容详情", false],
  ["get", "/v1/collaborations", "content", "茶生活跨界合作", false],
  ["get", "/v1/favorites", "user", "收藏列表", true],
  ["put", "/v1/favorites/{productId}", "user", "收藏商品", true],
  ["delete", "/v1/favorites/{productId}", "user", "取消收藏", true],
  ["get", "/v1/products/{productId}/reviews", "catalog", "商品评价", false],
  ["post", "/v1/products/{productId}/reviews", "catalog", "购后评价", true],
  ["get", "/v1/notifications", "user", "用户通知", true],
  ["post", "/v1/notifications/{id}/read", "user", "标记通知已读", true],
  ["get", "/v1/admin/overview", "admin", "运营看板概览", "admin"],
  ["post", "/v1/admin/products", "admin", "新建商品", "admin"],
  ["patch", "/v1/admin/products/{id}", "admin", "编辑商品与库存", "admin"],
  ["patch", "/v1/admin/orders/{id}/status", "admin", "更新订单与物流状态", "admin"],
  ["post", "/v1/admin/content", "admin", "发布品牌内容", "admin"],
  ["post", "/v1/admin/promotions", "admin", "配置营销活动", "admin"],
  ["post", "/v1/admin/events", "admin", "配置茶会与直播", "admin"],
];

function pathParameters(path) {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => ({ name: match[1], in: "path", required: true, schema: { type: "string" } }));
}

function operation(method, path, tag, summary, security) {
  const result = {
    tags: [tag],
    summary,
    operationId: `${method}_${path.replaceAll(/[{}]/g, "").replaceAll(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
    parameters: pathParameters(path),
    responses: {
      200: { description: "成功", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
      400: { $ref: "#/components/responses/BadRequest" },
      401: { $ref: "#/components/responses/Unauthorized" },
      404: { $ref: "#/components/responses/NotFound" },
    },
  };
  if (["post", "put", "patch"].includes(method)) result.requestBody = { required: false, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } };
  if (security === true) result.security = [{ bearerAuth: [] }];
  if (security === "admin") result.security = [{ adminKey: [] }];
  return result;
}

export function buildOpenApi(baseUrl) {
  const paths = {};
  for (const [method, path, tag, summary, security] of operations) {
    paths[path] ||= {};
    paths[path][method] = operation(method, path, tag, summary, security);
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "予茶微信小程序 API",
      version: "0.1.0",
      description: "覆盖会员、精准营销、商品、交易、跨境物流、品牌内容、溯源、茶会、社群和运营后台。金额均为人民币分值。",
    },
    servers: [{ url: baseUrl }],
    tags: [...new Set(operations.map((item) => item[2]))].map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "opaque" },
        adminKey: { type: "apiKey", in: "header", name: "X-Admin-Key" },
      },
      schemas: {
        SuccessEnvelope: { type: "object", required: ["data", "requestId"], properties: { data: {}, requestId: { type: "string", format: "uuid" } } },
        ErrorEnvelope: { type: "object", required: ["error", "requestId"], properties: { error: { type: "object", required: ["code", "message"], properties: { code: { type: "string" }, message: { type: "string" }, details: {} } }, requestId: { type: "string" } } },
      },
      responses: {
        BadRequest: { description: "请求参数错误", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        Unauthorized: { description: "未登录或凭据无效", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        NotFound: { description: "资源不存在", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
      },
    },
  };
}

export const documentedOperationCount = operations.length;
