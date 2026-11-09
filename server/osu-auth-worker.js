/**
 * Cloudflare Worker: вход через osu! для osu! Gacha Tower.
 * 1) osu! перенаправляет сюда (/callback?code=...&state=<адрес игры>)
 * 2) Worker меняет code на токен osu!, узнаёт игрока (/api/v2/me)
 * 3) Выпускает Firebase custom token (uid = "osu:<id>") и возвращает игрока в игру:
 *    <адрес игры>#osutoken=...&name=...&avatar=...
 *
 * Секреты (Settings → Variables and Secrets, тип Secret):
 *   OSU_CLIENT_ID       — 74801
 *   OSU_CLIENT_SECRET   — секрет приложения osu! (НЕ публиковать)
 *   FB_CLIENT_EMAIL     — client_email из JSON сервисного аккаунта Firebase
 *   FB_PRIVATE_KEY      — private_key из того же JSON (вместе с BEGIN/END)
 */
const ALLOWED = ["https://gacha-on-osu.web.app", "https://gacha-on-osu.firebaseapp.com"];

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== "/callback") return new Response("osu! auth worker OK");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || ALLOWED[0];
    const back = ALLOWED.find(a => state.startsWith(a)) ? state : ALLOWED[0];
    if (!code) return Response.redirect(back, 302);
    try {
      const tok = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: Number(env.OSU_CLIENT_ID), client_secret: env.OSU_CLIENT_SECRET,
          code, grant_type: "authorization_code", redirect_uri: url.origin + "/callback",
        }),
      }).then(r => r.json());
      if (!tok.access_token) throw new Error("osu token: " + JSON.stringify(tok));
      const meRes = await fetch("https://osu.ppy.sh/api/v2/me", { headers: { Authorization: "Bearer " + tok.access_token } }).then(r => r.json());
      const custom = await firebaseCustomToken(env, "osu:" + meRes.id, { osu_id: meRes.id, osu_name: meRes.username });
      const h = new URLSearchParams({ osutoken: custom, name: meRes.username, avatar: meRes.avatar_url || "" });
      return Response.redirect(back + "#" + h.toString(), 302);
    } catch (e) {
      return new Response("Login error: " + e.message, { status: 500 });
    }
  },
};

function b64url(data) {
  const s = typeof data === "string" ? btoa(unescape(encodeURIComponent(data))) : btoa(String.fromCharCode(...new Uint8Array(data)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function firebaseCustomToken(env, uid, claims) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.FB_CLIENT_EMAIL, sub: env.FB_CLIENT_EMAIL,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: now, exp: now + 3600, uid, claims,
  };
  const pem = env.FB_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const input = b64url(JSON.stringify(header)) + "." + b64url(JSON.stringify(payload));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(input));
  return input + "." + b64url(sig);
}
