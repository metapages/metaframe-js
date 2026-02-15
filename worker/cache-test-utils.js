// Cache Test Utilities - Loaded on demand for debugging
// This file is not part of the core index.html to keep it lightweight

const CacheTestUtils = {
  async showCacheInfo() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    const info = await globalThis.serviceWorkerManager.getCacheInfo();
    if (info) {
      globalThis.logStdout(`📋 Cache Info:
Name: ${info.name}
Version: ${info.version}  
Cached URLs: ${info.count}
URLs: ${info.urls.join("\n")}`);
    } else {
      globalThis.logStdout("❌ No cache information available");
    }
  },

  async clearCache() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    await globalThis.serviceWorkerManager.clearCache();
    globalThis.logStdout("🗑️ Cache cleared successfully");
  },

  async showConfig() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    const config = await globalThis.serviceWorkerManager.getConfig();
    if (config) {
      globalThis.logStdout(`⚙️ Service Worker Configuration:
${JSON.stringify(config, null, 2)}`);
    } else {
      globalThis.logStdout("❌ No configuration available");
    }
  },

  async updateConfig(newConfig) {
    if (!globalThis.logStdout || !globalThis.logStderr) {
      console.log("log functions not available, using console");
      globalThis.logStdout = console.log;
      globalThis.logStderr = console.error;
    }

    try {
      await globalThis.serviceWorkerManager.updateConfig(newConfig);
      globalThis.logStdout("✅ Configuration updated successfully");
    } catch (error) {
      globalThis.logStderr(
        `❌ Failed to update configuration: ${error.message}`,
      );
    }
  },

  async testCaching() {
    if (!globalThis.logStdout || !globalThis.logStderr) {
      console.log("log functions not available, using console");
      globalThis.logStdout = console.log;
      globalThis.logStderr = console.error;
    }

    globalThis.logStdout("🧪 Testing cache functionality...");

    // Test with a CDN resource
    const testUrl =
      "https://cdn.jsdelivr.net/npm/@metapages/hash-query@0.9.12/package.json";

    try {
      const response1 = await fetch(testUrl);
      const data1 = await response1.text();
      globalThis.logStdout(`📡 First fetch completed (should be cache miss)`);

      // Wait a moment then fetch again
      setTimeout(async () => {
        try {
          const response2 = await fetch(testUrl);
          const data2 = await response2.text();
          globalThis.logStdout(
            `✅ Second fetch completed (should be cache hit)`,
          );

          globalThis.logStdout(
            "🧪 Cache test completed. Check console for cache status logs.",
          );
        } catch (error) {
          globalThis.logStderr(`❌ Second fetch failed: ${error.message}`);
        }
      }, 1000);
    } catch (error) {
      globalThis.logStderr(`❌ First fetch failed: ${error.message}`);
    }
  },

  async testS3Caching() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    globalThis.logStdout("🪣 Testing AWS S3 URL normalization...");
    globalThis.logStdout(
      "Note: This simulates how different pre-signed URLs for the same S3 object are cached together.",
    );

    // Simulate two different pre-signed URLs for the same S3 object
    const baseUrl = "https://my-bucket.s3.amazonaws.com/video.mp4";
    const url1 = baseUrl +
      "?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE&X-Amz-Date=20231201T120000Z&X-Amz-Expires=3600&X-Amz-Signature=example1";
    const url2 = baseUrl +
      "?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE&X-Amz-Date=20231201T130000Z&X-Amz-Expires=3600&X-Amz-Signature=example2";

    globalThis.logStdout(
      "📋 Example URLs that would be cached as the same resource:",
    );
    globalThis.logStdout(`URL 1: ${url1.substring(0, 80)}...`);
    globalThis.logStdout(`URL 2: ${url2.substring(0, 80)}...`);
    globalThis.logStdout(`Both normalize to: ${baseUrl}`);
    globalThis.logStdout(
      "Enable debug mode to see URL normalization in action!",
    );
  },

  async checkForUpdates() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    globalThis.logStdout("🔍 Checking for website updates...");
    const hasUpdate = await globalThis.serviceWorkerManager.checkForUpdates();
    if (hasUpdate) {
      globalThis.logStdout(
        "🔄 Update found! Refresh the page to get the latest version.",
      );
    } else {
      globalThis.logStdout("✅ You're running the latest version.");
    }
  },

  async forceUpdate() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    globalThis.logStdout("🔄 Forcing website update and refresh...");
    await globalThis.serviceWorkerManager.forceUpdate();
  },

  async refreshConfig() {
    if (!globalThis.logStdout) {
      console.log("logStdout not available, using console.log");
      globalThis.logStdout = console.log;
    }

    // Re-read hash params and update service worker config
    if (typeof getServiceWorkerConfig === "function") {
      globalThis.serviceWorkerConfig = getServiceWorkerConfig();
      if (globalThis.serviceWorkerManager.registration) {
        await globalThis.serviceWorkerManager.updateConfig(
          globalThis.serviceWorkerConfig,
        );
      }
      globalThis.logStdout("⚙️ Configuration refreshed from hash params");
    } else {
      globalThis.logStdout("❌ getServiceWorkerConfig function not available");
    }
  },
};

// Make it available globally for console access
if (typeof window !== "undefined") {
  window.CacheTestUtils = CacheTestUtils;

  // Provide instructions
  console.log(`
🧪 Cache Test Utilities Loaded

Available methods:
• CacheTestUtils.showCacheInfo() - Show cached resources
• CacheTestUtils.clearCache() - Clear all cached resources  
• CacheTestUtils.showConfig() - Show current configuration
• CacheTestUtils.testCaching() - Test cache functionality
• CacheTestUtils.testS3Caching() - Demo AWS S3 URL normalization
• CacheTestUtils.checkForUpdates() - Check for website updates
• CacheTestUtils.forceUpdate() - Force update and refresh
• CacheTestUtils.refreshConfig() - Refresh config from hash params

✨ Features:
- Content-Type based caching (videos, audio, etc.)
- AWS S3 pre-signed URL normalization
- Separated from core for performance
`);
}

export default CacheTestUtils;
