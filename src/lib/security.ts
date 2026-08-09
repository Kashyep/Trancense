import { headers } from "next/headers";

/** Server Actions are network endpoints. Reject cross-site form posts before mutation. */
export async function assertActionOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (origin && host) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host || !["http:", "https:"].includes(originUrl.protocol)) {
      throw new Error("This request could not be verified.");
    }
  }
}

export function publicActionError(fallback: string) {
  return fallback;
}
