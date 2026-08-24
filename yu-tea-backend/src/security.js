import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { ApiError } from "./errors.js";

export function newId(prefix) {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

export function newToken(prefix = "yt") {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function bearerToken(headers) {
  const value = headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(value);
  return match?.[1] || null;
}

export function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireAdmin(headers, configuredKey) {
  const supplied = headers["x-admin-key"];
  if (!supplied || !safeEqual(supplied, configuredKey)) {
    throw new ApiError(401, "ADMIN_AUTH_REQUIRED", "需要有效的 X-Admin-Key");
  }
}
