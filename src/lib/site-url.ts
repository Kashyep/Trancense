const localOrigin = "http://localhost:3000";

/**
 * Produces a safe origin for canonical metadata and crawler routes. Production
 * deployments must provide an HTTPS NEXT_PUBLIC_APP_URL; the local fallback is
 * deliberately unsuitable for public deployment and is called out in the
 * pre-deployment checklist.
 */
export function canonicalOrigin(raw = process.env.NEXT_PUBLIC_APP_URL): URL {
  try {
    const origin = new URL(raw ?? localOrigin);
    const isLocalDevelopment = origin.protocol === "http:" && origin.hostname === "localhost";
    if (origin.username || origin.password || (origin.protocol !== "https:" && !isLocalDevelopment)) {
      return new URL(localOrigin);
    }
    origin.pathname = "/";
    origin.search = "";
    origin.hash = "";
    return origin;
  } catch {
    return new URL(localOrigin);
  }
}

export function canonicalUrl(pathname: string, origin = canonicalOrigin()): string {
  return new URL(pathname, origin).toString();
}
