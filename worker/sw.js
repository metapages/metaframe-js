// Version should be updated whenever the website is updated
// This should ideally be set during build process
const SW_VERSION = "1.0.1";
const CACHE_NAME = `metaframe-js-cache-v${SW_VERSION.replace(/\./g, "-")}`;

// Default configuration - can be overridden via message
let config = {
  enableLogging: false,
  cacheableUrlPatterns: [
    // Static assets by file extension
    /^https?:\/\/.*\.(js|css|html|json|png|jpg|jpeg|gif|svg|woff|woff2|ttf|mp4|webm|ogg|mp3|wav|flac)(\?.*)?$/i,
    // Known CDNs and package registries
    /^https?:\/\/cdn\.jsdelivr\.net\/.*$/i,
    /^https?:\/\/esm\.sh\/.*$/i,
    /^https?:\/\/deno\.land\/.*$/i,
    /^https?:\/\/unpkg\.com\/.*$/i,
    // Metapage assets
    /^https?:\/\/.*\.metapage\.io\/.*\.(png|jpg|jpeg|gif|svg|mp4|webm)$/i,
  ],
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  staleWhileRevalidateEnabled: true,
};

function log(...args) {
  if (config.enableLogging) {
    console.log("[SW]", ...args);
  }
}

function normalizeUrlForCaching(url) {
  try {
    const urlObj = new URL(url);

    // Check if this looks like an AWS S3 URL
    const isS3Url = urlObj.hostname.includes(".s3.") ||
      urlObj.hostname.includes("s3.amazonaws.com") ||
      urlObj.hostname.includes(".s3-") ||
      urlObj.hostname.endsWith(".amazonaws.com");

    if (isS3Url) {
      // AWS S3 pre-signed URL parameters to remove for caching
      const awsParamsToRemove = [
        "X-Amz-Algorithm",
        "X-Amz-Credential",
        "X-Amz-Date",
        "X-Amz-Expires",
        "X-Amz-SignedHeaders",
        "X-Amz-Signature",
        "X-Amz-Security-Token",
        "AWSAccessKeyId",
        "Signature",
        "Expires",
      ];

      // Remove AWS auth parameters
      awsParamsToRemove.forEach((param) => {
        urlObj.searchParams.delete(param);
      });

      log("🔗 Normalized S3 URL for caching:", url, "→", urlObj.toString());
      return urlObj.toString();
    }

    // For non-S3 URLs, return as-is
    return url;
  } catch (error) {
    // If URL parsing fails, return original
    log("❌ Failed to normalize URL:", url, error);
    return url;
  }
}

function shouldCache(url, response = null) {
  // Don't cache URLs with hash fragments (these are usually dynamic editor content)
  if (url.includes("#")) {
    return false;
  }

  // Don't cache chrome extension URLs
  if (url.startsWith("chrome-extension://")) {
    return false;
  }

  // Don't cache localhost metaframe.json files (they're dynamic)
  if (
    url.includes("metaframe.json") &&
    (url.includes("localhost") || url.includes("127.0.0.1"))
  ) {
    return false;
  }

  // If we have a response, check Content-Type header for cacheability
  if (response) {
    const contentType = response.headers.get("content-type") || "";
    const cacheableContentTypes = [
      "text/javascript",
      "application/javascript",
      "text/css",
      "text/html",
      "application/json",
      "image/",
      "video/",
      "audio/",
      "font/",
      "application/font",
      "text/plain",
      "application/octet-stream",
    ];

    const isContentTypeCacheable = cacheableContentTypes.some((type) =>
      contentType.toLowerCase().startsWith(type)
    );

    if (isContentTypeCacheable) {
      return true;
    }
  }

  // Fall back to URL pattern matching for known CDNs and file extensions
  return config.cacheableUrlPatterns.some((pattern) => pattern.test(url));
}

async function isResponseStale(cachedResponse) {
  if (!cachedResponse) return true;

  const cacheTime = cachedResponse.headers.get("sw-cache-time");
  if (!cacheTime) return true;

  const age = Date.now() - parseInt(cacheTime);
  return age > config.maxCacheAge;
}

async function addCacheHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("sw-cache-time", Date.now().toString());
  headers.set("sw-version", SW_VERSION);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

async function fetchAndCache(request) {
  try {
    // Ensure redirects are followed by default
    const response = await fetch(request, { redirect: "follow" });

    // Only cache successful responses, using both URL and Content-Type checking
    if (response.ok && response.status >= 200 && response.status < 300) {
      // Use the final URL after redirects for caching decision
      const finalUrl = response.url || request.url;

      if (shouldCache(finalUrl, response)) {
        // Clone before returning so the original response body remains usable
        const responseToCache = response.clone();
        const normalizedUrl = normalizeUrlForCaching(request.url);

        // Cache in background — do not block the response
        caches.open(CACHE_NAME).then(async (cache) => {
          try {
            const responseWithHeaders = await addCacheHeaders(responseToCache);
            // Create a normalized request for caching (removes AWS auth params)
            const normalizedRequest = new Request(normalizedUrl, {
              method: request.method,
              headers: request.headers,
              mode: request.mode,
              credentials: "omit",
            });
            await cache.put(normalizedRequest, responseWithHeaders);
            log(
              "🔄 Cached:",
              request.url,
              `→ ${finalUrl}`,
              `(${response.headers.get("content-type") || "unknown type"})`,
            );
            if (normalizedUrl !== request.url) {
              log("🔗 Using normalized cache key:", normalizedUrl);
            }
            if (finalUrl !== request.url) {
              log("🔀 Followed redirect:", request.url, "→", finalUrl);
            }
          } catch (cacheError) {
            log("❌ Failed to cache:", request.url, cacheError);
          }
        });
      }
    }

    return response;
  } catch (error) {
    log("❌ Fetch error:", error, "for", request.url);
    throw error;
  }
}

self.addEventListener("install", (event) => {
  log("🚀 Service Worker installing, version:", SW_VERSION);
  // Uncomment the guard below if precaching causes issues during local development
  // const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  // if (!isLocal) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/index.html"]);
    }),
  );
  // }
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  log("✅ Service Worker activated, version:", SW_VERSION);
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Don't cache requests to the service worker itself
  if (event.request.url.includes("/sw.js")) return;

  // Handle navigation requests (HTML pages) with network-first strategy
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            // Cache in background — do not block navigation response
            const responseToCache = response.clone();
            const req = event.request;
            caches.open(CACHE_NAME).then(async (cache) => {
              try {
                const responseWithHeaders = await addCacheHeaders(
                  responseToCache,
                );
                await cache.put(req, responseWithHeaders);
              } catch (cacheError) {
                log("❌ Failed to cache navigation:", req.url, cacheError);
              }
            });
          }
          return response;
        } catch (error) {
          // Offline — serve cached version
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(event.request) ||
            await cache.match("/index.html");
          if (cached) return cached;
          throw error;
        }
      })(),
    );
    return;
  }

  if (!shouldCache(event.request.url)) {
    if (config.enableLogging) {
      log("⚪ Not caching (not matching patterns):", event.request.url);
    }
    return;
  }

  if (!config.staleWhileRevalidateEnabled) {
    if (config.enableLogging) {
      log(
        "⚪ Stale-while-revalidate disabled, passing through:",
        event.request.url,
      );
    }
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try to match with normalized URL for AWS S3 URLs
      const normalizedUrl = normalizeUrlForCaching(event.request.url);
      const normalizedRequest = new Request(normalizedUrl, {
        method: event.request.method,
        headers: event.request.headers,
        mode: event.request.mode,
        credentials: "omit",
      });

      const cachedResponse = await cache.match(normalizedRequest);

      if (normalizedUrl !== event.request.url && config.enableLogging) {
        log("🔍 Looking up cache with normalized URL:", normalizedUrl);
      }

      if (cachedResponse) {
        const isStale = await isResponseStale(cachedResponse);

        if (isStale) {
          log(
            "📡 Serving stale content, revalidating in background:",
            event.request.url,
          );
          // Serve stale content immediately
          // Revalidate in background (don't await) - fetchAndCache already handles redirects
          fetchAndCache(event.request).catch((error) => {
            log(
              "❌ Background revalidation failed:",
              error,
              "for",
              event.request.url,
            );
          });

          // Add header to indicate this was served from cache
          const headers = new Headers(cachedResponse.headers);
          headers.set("sw-cache-status", "stale");
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: headers,
          });
        } else {
          log("✅ Serving fresh cached content:", event.request.url);
          const headers = new Headers(cachedResponse.headers);
          headers.set("sw-cache-status", "fresh");
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: headers,
          });
        }
      } else {
        log("🌐 No cache, fetching fresh:", event.request.url);
        try {
          const response = await fetchAndCache(event.request);

          // Only add cache status header for successful responses
          if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set("sw-cache-status", "miss");
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: headers,
            });
          }

          // Return original response for non-OK responses
          return response;
        } catch (error) {
          log("❌ Fetch failed completely:", error, "for", event.request.url);
          // Let the browser handle the error naturally with redirect following
          return fetch(event.request, { redirect: "follow" });
        }
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "UPDATE_CONFIG":
      config = { ...config, ...payload };
      log("📝 Configuration updated:", config);
      event.ports[0].postMessage({ success: true });
      break;

    case "GET_CONFIG":
      event.ports[0].postMessage({ config });
      break;

    case "CLEAR_CACHE":
      caches.delete(CACHE_NAME).then(() => {
        log("🗑️ Cache cleared");
        event.ports[0].postMessage({ success: true });
      });
      break;

    case "GET_CACHE_INFO":
      caches.open(CACHE_NAME).then((cache) => {
        return cache.keys();
      }).then((requests) => {
        const urls = requests.map((req) => req.url);
        event.ports[0].postMessage({
          cacheInfo: {
            name: CACHE_NAME,
            version: SW_VERSION,
            urls: urls,
            count: urls.length,
          },
        });
      });
      break;

    default:
      log("❓ Unknown message type:", type);
  }
});
