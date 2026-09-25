const crypto = require("node:crypto");

const ADMIN_COOKIE = "eha_admin";
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;
const MIN_ADMIN_PASSWORD_LENGTH = 12;

// Password login for the admin view, with a stateless signed session cookie
// (no session store, no extra dependency). The signing key is derived from the
// password itself, so changing ADMIN_PASSWORD signs every admin out.
function createAdminAuth({ password, secureCookie, now = () => new Date(), path = "/admin" }) {
  const key = crypto.createHmac("sha256", password).update("eha-admin-session-v1").digest();
  const sign = (value) => crypto.createHmac("sha256", key).update(value).digest("hex");
  const digest = (value) => crypto.createHash("sha256").update(String(value)).digest();
  const safeEqual = (a, b) => {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  };
  const cookieHeader = (value, maxAgeSeconds) =>
    `${ADMIN_COOKIE}=${value}; Path=${path}; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict${secureCookie ? "; Secure" : ""}`;

  return {
    // Hash both sides so neither the length nor the content of the password
    // leaks through comparison timing.
    checkPassword(candidate) {
      return crypto.timingSafeEqual(digest(candidate), digest(password));
    },
    issueSession(res) {
      const body = `${now().getTime() + ADMIN_SESSION_MS}.${crypto.randomBytes(16).toString("hex")}`;
      res.append("Set-Cookie", cookieHeader(`${body}.${sign(body)}`, ADMIN_SESSION_MS / 1000));
    },
    clearSession(res) {
      res.append("Set-Cookie", cookieHeader("", 0));
    },
    // Returns the valid session token from the request, or null.
    sessionFrom(req) {
      const raw = String(req.headers.cookie || "")
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
      const token = raw ? raw.slice(ADMIN_COOKIE.length + 1) : "";
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [expires, nonce, signature] = parts;
      if (!/^\d+$/.test(expires) || Number(expires) <= now().getTime()) return null;
      return safeEqual(signature, sign(`${expires}.${nonce}`)) ? token : null;
    },
    // Per-session token for state-changing forms, on top of SameSite=Strict.
    csrfToken(sessionToken) {
      return sign(`csrf:${sessionToken}`);
    },
    validCsrf(sessionToken, candidate) {
      return typeof candidate === "string" && safeEqual(candidate, sign(`csrf:${sessionToken}`));
    }
  };
}

module.exports = { createAdminAuth, ADMIN_COOKIE, ADMIN_SESSION_MS, MIN_ADMIN_PASSWORD_LENGTH };
