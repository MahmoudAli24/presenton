import { NextRequest, NextResponse } from "next/server";

const AHLAN_ORIGIN = process.env.NEXT_PUBLIC_AHLAN_ORIGIN || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const COOKIE_NAME = "presenton-admin";

// Pages allowed without admin auth (iframe embed + internal tools)
const ALLOWED_PAGE_PATHS = ["/presentation", "/pdf-maker", "/schema", "/blocked", "/login"];

function originMatches(headerValue: string | null): boolean {
  if (!headerValue || !AHLAN_ORIGIN) return false;
  try {
    const url = new URL(headerValue);
    return url.origin === AHLAN_ORIGIN;
  } catch {
    return headerValue === AHLAN_ORIGIN;
  }
}

function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get("host") || "";
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0")
  );
}

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PAGE_PATHS.some((p) => pathname.startsWith(p));
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidAdmin(request: NextRequest): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const expected = await sha256Hex(`presenton:${ADMIN_PASSWORD}`);
  return cookie === expected;
}

function block(request: NextRequest) {
  return NextResponse.rewrite(new URL("/blocked", request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the blocked page and login page
  if (pathname === "/blocked" || pathname === "/login") {
    return NextResponse.next();
  }

  // Always allow auth API routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Admin with valid cookie gets full access to everything
  if (await isValidAdmin(request)) {
    return NextResponse.next();
  }

  // --- Block disallowed page paths (non-admins can only access allowed paths) ---
  if (!pathname.startsWith("/api/") && !isAllowedPath(pathname)) {
    return block(request);
  }

  // If AHLAN_ORIGIN is not configured, skip origin enforcement (dev mode)
  if (!AHLAN_ORIGIN) {
    return NextResponse.next();
  }

  const secFetchDest = request.headers.get("sec-fetch-dest");
  const secFetchSite = request.headers.get("sec-fetch-site");
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");

  // --- API routes ---
  if (pathname.startsWith("/api/")) {
    // Same-origin fetch from iframe pages
    if (secFetchSite === "same-origin") {
      return NextResponse.next();
    }

    // Server-to-server calls from Ahlan backend
    if (request.headers.get("x-api-key")) {
      return NextResponse.next();
    }

    // Localhost (Puppeteer internal calls)
    if (isLocalhost(request)) {
      return NextResponse.next();
    }

    // Cross-origin calls from Ahlan (iframe page making fetch to API)
    if (secFetchSite === "cross-site" && originMatches(origin)) {
      return NextResponse.next();
    }

    // Block everything else
    return NextResponse.json(
      { error: "Forbidden: API access restricted" },
      { status: 403 }
    );
  }

  // --- Allowed page requests: enforce iframe-only access ---

  // 1. Iframe load from Ahlan: sec-fetch-dest=iframe + origin/referer matches Ahlan
  if (
    secFetchDest === "iframe" &&
    (originMatches(referer) || originMatches(origin))
  ) {
    return NextResponse.next();
  }

  // 2. In-iframe navigation (hard refresh, location.href): same-origin
  if (secFetchSite === "same-origin") {
    return NextResponse.next();
  }

  // 3. Localhost bypass (Puppeteer for PDF generation)
  if (isLocalhost(request)) {
    return NextResponse.next();
  }

  // 4. Fallback for browsers without Sec-Fetch headers: check referer
  if (!secFetchDest && !secFetchSite && originMatches(referer)) {
    return NextResponse.next();
  }

  // 5. Block direct browser access
  return block(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|Logo.png|app_data/|.*\\.(?:png|svg|gif|jpg|ico|woff|woff2|ttf|css|js|map)$).*)",
  ],
};
