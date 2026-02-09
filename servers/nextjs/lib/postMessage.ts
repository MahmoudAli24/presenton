export function postMessageToParent(data: unknown): void {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  const origin = process.env.NEXT_PUBLIC_AHLAN_ORIGIN;
  if (!origin) return;
  window.parent.postMessage(data, origin);
}
