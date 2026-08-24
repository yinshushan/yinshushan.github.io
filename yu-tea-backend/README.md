# 予茶微信小程序后端

一套可直接运行的零第三方依赖 Node.js API，与当前“予茶·数字化转型的新茶道”小程序业务对齐。默认使用本地 JSON 持久化和微信/支付模拟模式，适合开发、联调和产品验收。

## 已实现的接口域

- 微信登录、令牌刷新、退出、手机号绑定和个人资料
- 会员入会、会员等级、茶分明细和优惠券
- 8 个一级茶类、24 款种子商品、搜索、库存、收藏和购后评价
- 购物车、优惠试算、地址、幂等下单、订单、退款状态和物流轨迹
- 国内与跨境运费试算、报关字段和 5 个种子国家/地区
- 微信支付下单合同、模拟支付和微信支付回调入口
- 拼团、秒杀资格锁定、优惠券和活动配置
- 茶会、直播预约、企业微信社群加入状态和用户通知
- 品牌故事、茶文化科普、产品批次溯源和跨界合作
- 运营端概览、商品/库存、订单发货、内容、营销和茶会配置

总计 65 个 OpenAPI 操作（包含 `/health`），另有 `/openapi.json` 文档路由；服务实际注册 66 条路由。

## 启动

需要 Node.js 20 或更高版本。

```bash
cp .env.example .env
npm run check
npm test
npm start
```

默认地址：

- API: `http://127.0.0.1:8787`
- 健康检查: `http://127.0.0.1:8787/health`
- OpenAPI: `http://127.0.0.1:8787/openapi.json`

服务会将数据写入 `data/yu-tea.json`。测试使用内存库，不会污染本地数据。

## 快速联调

### 1. 微信模拟登录

```bash
curl -s http://127.0.0.1:8787/v1/auth/wechat-login \
  -H 'Content-Type: application/json' \
  -d '{"code":"dev-user-001","userProfile":{"nickname":"山席茶友"}}'
```

从返回值中取得 `accessToken`，后续用户接口使用：

```text
Authorization: Bearer <accessToken>
```

### 2. 入会领茶礼

```bash
curl -s http://127.0.0.1:8787/v1/membership/join \
  -X POST \
  -H 'Authorization: Bearer <accessToken>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### 3. 加购物车并试算

```bash
curl -s http://127.0.0.1:8787/v1/cart/items \
  -X POST \
  -H 'Authorization: Bearer <accessToken>' \
  -H 'Content-Type: application/json' \
  -d '{"productId":"white-2017-forest","quantity":1}'

curl -s http://127.0.0.1:8787/v1/cart/quote \
  -X POST \
  -H 'Authorization: Bearer <accessToken>' \
  -H 'Content-Type: application/json' \
  -d '{"couponId":"coupon-new-30","countryCode":"CN"}'
```

## 约定

- 金额字段一律使用人民币“分”，避免浮点误差。
- 创建订单必须传 `Idempotency-Key`，防止小程序重试造成重复下单。
- 用户接口使用 Bearer 令牌；运营端使用 `X-Admin-Key`。
- 密码、AppSecret、支付私钥和用户隐私数据不应提交到代码库。
- 生产环境须使用 HTTPS，并将合法请求域名配置到小程序平台。

## 模拟与生产边界

`AUTH_MODE=mock` 时：

- 登录 code 在本地确定性地转换为 mock openid。
- `/v1/payments/:id/mock-confirm` 可完成支付、扣库存和发茶分。
- 支付回调要求 `X-WeChat-Mock-Signature: valid`。

`AUTH_MODE=wechat` 时，服务会要求微信凭据，但不会伪造上游成功。正式上线前还需接入真实的 code2Session、微信支付 v3、物流、订阅消息、企业微信活码和生产数据库。详见 [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)。

## 目录

- `src/app.js`: HTTP 路由、鉴权与业务逻辑
- `src/store.js`: 本地 JSON 持久化
- `src/seed.js`: 与当前小程序对齐的商品和内容数据
- `src/openapi.js`: OpenAPI 3.1 合同
- `test/api.test.js`: 主要业务链路端到端测试
- `examples/miniprogram-api.js`: 原生微信小程序调用示例
