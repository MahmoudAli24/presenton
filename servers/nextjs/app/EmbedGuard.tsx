"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Only these page paths are allowed without admin auth
const ALLOWED_PATHS = ["/presentation", "/pdf-maker", "/schema", "/blocked", "/login"];
const AHLAN_ORIGIN = process.env.NEXT_PUBLIC_AHLAN_ORIGIN || "";
const COOKIE_NAME = "presenton-admin";

function hasAdminCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

export function EmbedGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Admin with cookie gets full access
    if (hasAdminCookie()) {
      setChecked(true);
      return;
    }

    // Block disallowed paths (like /, /upload, /dashboard, etc.)
    const isAllowed = ALLOWED_PATHS.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      router.replace("/blocked");
      return;
    }

    // If AHLAN_ORIGIN is not configured, skip iframe enforcement (dev mode)
    if (!AHLAN_ORIGIN) {
      setChecked(true);
      return;
    }

    // Skip iframe check for paths accessed by Puppeteer directly
    if (pathname.startsWith("/pdf-maker") || pathname.startsWith("/schema")) {
      setChecked(true);
      return;
    }

    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      // Cross-origin access to window.top throws — means we're in an iframe
      inIframe = true;
    }

    if (!inIframe) {
      router.replace("/blocked");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked) return null;

  return <>{children}</>;
}
