import { headers } from "next/headers";

export function isSameOriginRequest(requestUrl: string, origin: string | null): boolean {
  if (!origin) return false;
  try {
    return new URL(requestUrl).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/** Route handlers do not inherit Server Action origin protection. */
export function assertRequestOrigin(request: Request) {
  if (!isSameOriginRequest(request.url, request.headers.get("origin"))) {
    throw new Error("This request could not be verified.");
  }
}

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
