function normalizeAppUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getAppBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured. Add it before generating subscriber management links. NEXT_PUBLIC_BASE_URL is also supported as a fallback.",
    );
  }

  return normalizeAppUrl(configuredUrl);
}

export function buildAbsoluteAppUrl(pathnameWithSearch: string) {
  return new URL(pathnameWithSearch, `${getAppBaseUrl()}/`).toString();
}
