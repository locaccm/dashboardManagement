// src/utils/envValidator.ts

/**
 * Validates that the given environment URL has an allowed protocol and hostname.
 * Throws an error if invalid.
 */
export function validateApiUrl(
  envUrl: string | undefined,
  allowedDomains: string[],
): string {
  if (!envUrl) throw new Error("Missing API URL");
  let url: URL;
  try {
    url = new URL(envUrl);
  } catch (e) {
    throw new Error(`Malformed API URL: ${envUrl}`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Invalid protocol: ${url.protocol}`);
  }
  if (!allowedDomains.includes(url.hostname)) {
    throw new Error(`Domain not allowed: ${url.hostname}`);
  }
  return envUrl;
}
