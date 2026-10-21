import { NextResponse } from "next/server";

/* HTTP Basic auth for /admin and /api/admin. Username is ignored; password = ADMIN_PASSWORD. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export function middleware(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return new NextResponse("Admin disabled: set ADMIN_PASSWORD", { status: 503 });
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Basic ")) {
    const decoded = atob(h.slice(6));
    if (safeEqual(decoded.slice(decoded.indexOf(":") + 1), pw)) return NextResponse.next();
  }
  return new NextResponse("Login required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="KSR Admin"' } });
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
