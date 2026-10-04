import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// (protected) 안에 있는 실제 URL들
const protectedPaths = [
  "/dashboard",
  "/users",
  "/packages",
  "/wallethistory",
  "/rewards",
  "/notices",
  "/events",
  "/permissions",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("AccessToken");
  const pathname = req.nextUrl.pathname;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // 🔐 쿠키 없음 / 만료 → 차단
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// auth / next 내부 리소스 제외
export const config = {
  matcher: ["/((?!_next|favicon.ico|auth).*)"],
};
