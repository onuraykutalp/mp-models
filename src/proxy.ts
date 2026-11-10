import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/token";

const LOGIN = "/admin/login";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Never cache authenticated admin HTML.
  const withNoStore = (res: NextResponse) => {
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };

  if (pathname === LOGIN) {
    const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session) return withNoStore(NextResponse.redirect(new URL("/admin", req.nextUrl)));
    return withNoStore(NextResponse.next());
  }

  const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL(LOGIN, req.nextUrl);
    // Only bounce back to safe admin paths — never an open redirect.
    if (pathname.startsWith("/admin") && !pathname.includes("://") && !pathname.includes("\\")) {
      url.searchParams.set("next", pathname + search);
    }
    return withNoStore(NextResponse.redirect(url));
  }

  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
