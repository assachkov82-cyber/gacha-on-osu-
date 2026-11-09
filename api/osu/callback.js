/**
 * Vercel Serverless Function: вход через osu! для osu! Gacha Tower.
 * Адрес: https://gacha-on-osu.vercel.app/api/osu/callback  (его же указать в osu! как Application Callback URL)
 * 1) osu! присылает ?code=...&state=<адрес игры>
 * 2) меняем code на токен osu!, узнаём игрока (/api/v2/me)
 * 3) выпускаем Firebase custom token (uid = "osu:<id>") и возвращаем игрока в игру:
 *    <адрес игры>#osutoken=...&name=...&avatar=...
 *
 * Переменные окружения (Vercel → Project → Settings → Environment Variables):
 *   OSU_CLIENT_ID, OSU_CLIENT_SECRET, FB_CLIENT_EMAIL, FB_PRIVATE_KEY
 * Секреты НЕ хранить в репозитории.
 */
const crypto = require("crypto");

const ALLOWED = ["https://gacha-on-osu.vercel.app", "https://gacha-on-osu.web.app", "https://gacha-on-osu.firebaseapp.com"];

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function firebaseCustomToken(uid, claims) {
  const email = process.env.FB_CLIENT_EMAIL;
  const key = (process.env.FB_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email, sub: email,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now, exp: now + 3600, uid, claims,
  };
  const input = b64url(JSON.stringify(header)) + "." + b64url(JSON.stringify(payload));
  const sig = crypto.createSign("RSA-SHA256").update(input).sign(key);
  return input + "." + b64url(sig);
}

module.exports = async (req, res) => {
  const host = "https://" + (req.headers["x-forwarded-host"] || req.headers.host);
  const q = req.query || {};
  const state = String(q.state || ALLOWED[0]);
  const back = ALLOWED.find((a) => state.startsWith(a)) ? state : ALLOWED[0];
  const go = (url) => { res.statusCode = 302; res.setHeader("Location", url); res.end(); };
  if (!q.code) return go(back);
  try {
    const tok = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: Number(process.env.OSU_CLIENT_ID), client_secret: process.env.OSU_CLIENT_SECRET,
        code: String(q.code), grant_type: "authorization_code", redirect_uri: host + "/api/osu/callback",
      }),
    }).then((r) => r.json());
    if (!tok.access_token) throw new Error("osu token: " + JSON.stringify(tok));
    const me = await fetch("https://osu.ppy.sh/api/v2/me", { headers: { Authorization: "Bearer " + tok.access_token } }).then((r) => r.json());
    const custom = firebaseCustomToken("osu:" + me.id, { osu_id: me.id, osu_name: me.username });
    const h = new URLSearchParams({ osutoken: custom, name: me.username, avatar: me.avatar_url || "" });
    return go(back + "#" + h.toString());
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Login error: " + e.message);
  }
};
