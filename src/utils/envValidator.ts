// src/utils/envValidator.ts

/**
 * Validates that the given environment URL has an allowed protocol and hostname.
 * Throws an error if invalid.
 */
export function validateApiUrl(
  envUrl: string | undefined,
  allowedDomains: string[],
): void {
  if (!envUrl) {
    throw new Error("Missing environment variable for API URL");
  }
  let url: URL;
  try {
    url = new URL(envUrl);
  } catch (e) {
    throw new Error(`Malformed environment URL: ${envUrl}`);
  }

  // Check protocol is http or https
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Invalid protocol: ${url.protocol}`);
  }

  // Check hostname is in allow-list
  if (!allowedDomains.includes(url.hostname)) {
    throw new Error(`Domain not allowed: ${url.hostname}`);
  }
}
