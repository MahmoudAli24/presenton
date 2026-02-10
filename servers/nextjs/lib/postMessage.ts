const STATIC_ORIGINS = ["https://test.ahlan.ai", "https://ahlan.ai"];
const AHLAN_ORIGINS = [...new Set([
  ...STATIC_ORIGINS,
  ...(process.env.NEXT_PUBLIC_AHLAN_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
])];

export function postMessageToParent(data: unknown): void {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  if (AHLAN_ORIGINS.length === 0) return;
  for (const origin of AHLAN_ORIGINS) {
    window.parent.postMessage(data, origin);
  }
}
