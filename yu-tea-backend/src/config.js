import path from "node:path";

function integer(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(env = process.env, cwd = process.cwd()) {
  return {
    host: env.HOST || "127.0.0.1",
    port: integer(env.PORT, 8787),
    publicBaseUrl: env.PUBLIC_BASE_URL || `http://${env.HOST || "127.0.0.1"}:${integer(env.PORT, 8787)}`,
    dataFile: env.DATA_FILE === ":memory:" ? null : path.resolve(cwd, env.DATA_FILE || "./data/yu-tea.json"),
    authMode: env.AUTH_MODE || "mock",
    adminApiKey: env.ADMIN_API_KEY || "yu-tea-local-admin",
    allowedOrigins: (env.ALLOWED_ORIGINS || "http://localhost:4173").split(",").map((item) => item.trim()).filter(Boolean),
    wechat: {
      appId: env.WECHAT_APP_ID || "",
      appSecret: env.WECHAT_APP_SECRET || "",
      payMchId: env.WECHAT_PAY_MCH_ID || "",
      payApiV3Key: env.WECHAT_PAY_API_V3_KEY || "",
      paySerialNo: env.WECHAT_PAY_SERIAL_NO || "",
      payPrivateKeyPath: env.WECHAT_PAY_PRIVATE_KEY_PATH || "",
    },
  };
}
