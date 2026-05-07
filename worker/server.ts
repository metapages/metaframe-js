import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { serveStatic } from "@hono/hono/deno";
import {
  setHashParamValueBase64EncodedInUrl,
  setHashParamValueBooleanInUrl,
  setHashParamValueInUrl,
  setHashParamValueJsonInUrl,
} from "@metapages/hash-query";
import { HashParamsObject, HashParamType } from "@metapages/metapage";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";
import {
  computeMetaframeDefinition,
  DEFAULT_METAFRAME_DEFINITION,
  getAllowedHashParams,
} from "./src/metaframe-definition.ts";

/**
 * Decodes a raw hash params string (e.g. "?js=abc&inputs=def") into a JSON
 * object with correctly decoded values, using the type metadata from
 * DEFAULT_METAFRAME_DEFINITION (and any user-provided definition).
 *
 * Handles both base64-wrapped encoding (new @metapages/hash-query format)
 * and plain URI-encoded values (old manual format).
 */
function decodeHashParamsToJson(hashParams: string): Record<string, unknown> {
  const cleaned = hashParams.startsWith("?") ? hashParams.slice(1) : hashParams;
  const searchParams = new URLSearchParams(cleaned);

  // Build type map from default definition
  const typeMap: Record<string, HashParamType> = {};
  const defaultHP = DEFAULT_METAFRAME_DEFINITION.hashParams;
  if (defaultHP && typeof defaultHP === "object" && !Array.isArray(defaultHP)) {
    for (const [k, v] of Object.entries(defaultHP)) {
      typeMap[k] = (v as { type?: HashParamType }).type || "json";
    }
  }

  // Decode definition (always json type) to discover custom param types
  const defRaw = searchParams.get("definition");
  if (defRaw) {
    try {
      let def: Record<string, unknown> | undefined;
      try {
        def = JSON.parse(decodeURIComponent(atob(defRaw)));
      } catch {
        def = JSON.parse(decodeURIComponent(defRaw));
      }
      const defHP = (def as Record<string, unknown>)?.hashParams;
      if (defHP && typeof defHP === "object" && !Array.isArray(defHP)) {
        for (
          const [k, v] of Object.entries(
            defHP as Record<string, { type?: HashParamType }>,
          )
        ) {
          if (!typeMap[k]) {
            typeMap[k] = v.type || "json";
          }
        }
      }
    } catch {
      // ignore decode errors for definition
    }
  }

  const result: Record<string, unknown> = {};

  for (const [key, rawValue] of searchParams) {
    const type = typeMap[key] || "json";

    try {
      if (type === "json") {
        try {
          result[key] = JSON.parse(decodeURIComponent(atob(rawValue)));
        } catch {
          result[key] = JSON.parse(decodeURIComponent(rawValue));
        }
      } else if (type === "stringBase64") {
        try {
          result[key] = decodeURIComponent(atob(rawValue));
        } catch {
          result[key] = rawValue;
        }
      } else if (type === "boolean") {
        result[key] = rawValue === "true";
      } else if (type === "number") {
        const num = parseFloat(rawValue);
        result[key] = isNaN(num) ? rawValue : num;
      } else {
        // "string" or unknown type
        result[key] = rawValue;
      }
    } catch {
      result[key] = rawValue;
    }
  }

  return result;
}

// Canonical hash param keys — these are stored in the short URL and cleaned
// from the URL bar after load. Any other keys are treated as user-defined
// state and preserved in the URL.
// NOTE: Keep in sync with editor/src/utils/hashParams.ts (DEFAULT_ALLOWED_HASH_PARAMS).
const CANONICAL_HASH_PARAM_KEYS = [
  "bgColor",
  "definition",
  "edit",
  "editorWidth",
  "hm",
  "inputs",
  "js",
  "modules",
  "options",
];

const port: number = parseInt(Deno.env.get("PORT") || "3000");

// S3-compatible storage config (works with Cloudflare R2 and MinIO)
const S3_ENDPOINT = Deno.env.get("S3_ENDPOINT");
const S3_ACCESS_KEY_ID = Deno.env.get("S3_ACCESS_KEY_ID");
const S3_SECRET_ACCESS_KEY = Deno.env.get("S3_SECRET_ACCESS_KEY");
const S3_BUCKET_NAME = Deno.env.get("S3_BUCKET_NAME") || "uploads";
const S3_PUBLIC_URL = Deno.env.get("S3_PUBLIC_URL");
const S3_UPLOAD_MAX_SIZE_MB = parseInt(
  Deno.env.get("S3_UPLOAD_MAX_SIZE_MB") || "500",
);

const getPublicUrl = (id: string) => {
  return `${S3_PUBLIC_URL}/${id}`;
};

const s3Credentials = S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY
  ? { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY }
  : undefined;

// Client for generating presigned URLs (uses browser-reachable endpoint)
// Falls back to the main S3 client if S3_PRESIGN_ENDPOINT is not set (e.g. production R2)
let s3PresignClient: S3Client | null = null;
if (s3Credentials) {
  const presignEndpoint = S3_ENDPOINT;
  if (presignEndpoint) {
    s3PresignClient = new S3Client({
      endpoint: presignEndpoint,
      forcePathStyle: true,
      region: "auto",
      credentials: s3Credentials,
      // Disable flexible checksums to avoid Deno CRC32 compatibility issues
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    if (S3_ENDPOINT) {
      console.log(`S3 presign client configured: endpoint=${S3_ENDPOINT}`);
    }
  }
}

const app = new Hono();

// Global CORS
app.use("*", cors({ origin: "*" }));

// Routes
const serveIndex = async () => {
  const indexHtml = await Deno.readTextFile("./index.html");
  return new Response(indexHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

app.get("/", () => serveIndex());
app.get("/index.html", () => serveIndex());

app.get("/sw.js", async () => {
  try {
    const swJs = await Deno.readTextFile("./sw.js");
    return new Response(swJs, {
      headers: {
        "Content-Type": "application/javascript",
        "Service-Worker-Allowed": "/",
      },
    });
  } catch (error) {
    console.error("Error serving service worker:", error);
    return new Response("Service worker not found", { status: 404 });
  }
});

app.get("/cache-test-utils.js", async () => {
  try {
    const testUtilsJs = await Deno.readTextFile("./cache-test-utils.js");
    return new Response(testUtilsJs, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error serving cache test utilities:", error);
    return new Response("Cache test utilities not found", { status: 404 });
  }
});

app.get("/metaframe.json", (c) => {
  return c.json(DEFAULT_METAFRAME_DEFINITION);
});

app.get("/editor/metaframe.json", (c) => {
  return c.json(DEFAULT_METAFRAME_DEFINITION);
});

// Upload presign endpoint — returns a presigned URL for direct browser-to-S3 upload
app.post("/api/upload/presign", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "File upload not configured" }, 503);
  }

  try {
    const body = await c.req.json();
    const { contentType, fileSize, sha256 } = body;

    if (!contentType) {
      return c.json({ error: "Missing required field: contentType" }, 400);
    }

    if (fileSize && fileSize > S3_UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
      return c.json(
        { error: `File too large. Max size: ${S3_UPLOAD_MAX_SIZE_MB}MB` },
        400,
      );
    }

    // Use SHA256 content hash if provided, otherwise fall back to UUID
    const id = sha256 || crypto.randomUUID();
    // Store file with just the id as the key (no filename)
    const key = `f/${id}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL using the browser-reachable endpoint
    const presignedUrl = await getSignedUrl(s3PresignClient, command, {
      expiresIn: 3600,
    });
    // Canonical path for accessing the file via the worker's download endpoint
    const canonicalPath = `/f/${id}`;

    return c.json({ presignedUrl, canonicalPath, key, id });
  } catch (error) {
    console.error("Presign error:", error);
    return c.json({ error: "Failed to generate presigned URL" }, 500);
  }
});

// URL shortening endpoint — stores hash params in S3
app.post("/api/shorten", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "URL shortening not configured" }, 503);
  }

  try {
    const body = await c.req.json();
    const { hashParams } = body;

    if (!hashParams) {
      return c.json({ error: "Missing required field: hashParams" }, 400);
    }

    // Calculate SHA256 hash on the server
    const encoder = new TextEncoder();
    const data = encoder.encode(hashParams);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const sha256 = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Store in S3 with key j/{sha256}
    const key = `j/${sha256}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: hashParams,
      ContentType: "text/plain; charset=utf-8",
    });

    await s3PresignClient.send(command);

    return c.json({
      success: true,
      id: sha256,
      path: `/j/${sha256}`,
    });
  } catch (error) {
    console.error("Shorten URL error:", error);
    return c.json({ error: "Failed to shorten URL" }, 500);
  }
});

// URL shortening from JSON body — encodes each field to hash-param format
app.post("/api/shorten/json", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "URL shortening not configured" }, 503);
  }

  try {
    const body = await c.req.json();

    // Supported keys, sorted alphabetically for SHA256 consistency
    const supportedKeysSet = getAllowedHashParams(body["definition"]);
    const supportedKeys = Array.from(supportedKeysSet);
    supportedKeys.sort();

    let url = new URL("https://js.mtfm.io/");

    for (const key of supportedKeys) {
      if (body[key] === undefined) continue;
      const type: HashParamType =
        (DEFAULT_METAFRAME_DEFINITION?.hashParams as HashParamsObject)?.[key]
          ?.type || "json";

      if (type === "json") {
        url = setHashParamValueJsonInUrl(url, key, body[key]);
      } else if (type === "stringBase64") {
        url = setHashParamValueBase64EncodedInUrl(url, key, body[key]);
      } else if (type === "string") {
        url = setHashParamValueInUrl(url, key, body[key]);
      } else if (type === "boolean") {
        url = setHashParamValueBooleanInUrl(url, key, body[key]);
      } else if (type === "number") {
        url = setHashParamValueInUrl(url, key, body[key]);
      }
      // File|Blob ignored for now
    }

    const hashParams = url.hash.slice(1);

    if (!hashParams) {
      return c.json({ error: "No recognised fields provided" }, 400);
    }

    // Calculate SHA256
    const encoder = new TextEncoder();
    const data = encoder.encode(hashParams);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const sha256 = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Store in S3
    const key = `j/${sha256}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: hashParams,
      ContentType: "text/plain; charset=utf-8",
    });
    await s3PresignClient.send(command);

    const protocol = c.req.header("x-forwarded-proto") || "https";
    const host = c.req.header("host");
    const origin = `${protocol}://${host}`;

    return c.json({
      id: sha256,
      shortUrl: `${origin}/j/${sha256}`,
      fullUrl: `${origin}/#${hashParams}`,
      hashParams,
    });
  } catch (error) {
    console.error("Shorten JSON error:", error);
    return c.json({ error: "Failed to shorten URL" }, 500);
  }
});

// Shortened URL — fetches hash params from S3 and serves index.html with injected init script
app.get("/j/:sha256", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "URL shortening not configured" }, 503);
  }

  try {
    const sha256 = c.req.param("sha256");

    // Validate sha256 format (64 hex characters)
    if (!sha256 || !/^[a-f0-9]{64}$/.test(sha256)) {
      return c.json({ error: "Invalid shortened URL ID" }, 400);
    }

    const key = `j/${sha256}`;

    // Fetch from S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3PresignClient.send(command);
    if (!response.Body) throw new Error("S3 response body is empty");
    const hashParams = await response.Body.transformToString();

    // Serve index.html with injected script that sets window.__SHORT_URL_ID
    // and calls history.replaceState so the hash is correct before module scripts run
    const indexHtml = await Deno.readTextFile("./index.html");
    const canonicalKeysJson = JSON.stringify(CANONICAL_HASH_PARAM_KEYS);
    const storedJson = JSON.stringify(hashParams);
    // The IIFE parses stored params into a key→pair map, then overrides with
    // any non-canonical params from the URL hash (user-defined state from a
    // previous session).  This avoids duplicate keys when stored params
    // already contain user-defined values from the time the URL was shortened.
    const injectedScript =
      `<script id="short-url-init">window.__SHORT_URL_ID = ${
        JSON.stringify(
          sha256,
        )
      };window.__SHORT_URL_HASH_PARAMS = ${storedJson};window.__SHORT_URL_CANONICAL_KEYS = new Set(${canonicalKeysJson});(function(){var stored = ${storedJson};var C = window.__SHORT_URL_CANONICAL_KEYS;var ss = stored.charAt(0)==='?' ? stored.slice(1) : stored;var sp = ss.split('&');var pm = {};var po = [];for(var i=0;i<sp.length;i++){var ei=sp[i].indexOf('=');var ki=ei===-1?sp[i]:sp[i].substring(0,ei);if(ki){pm[ki]=sp[i];po.push(ki);}}var h = window.location.hash;if(h){var s=h.charAt(0)==='#'?h.slice(1):h;if(s.charAt(0)==='?')s=s.slice(1);if(s){var up=s.split('&');for(var j=0;j<up.length;j++){var ej=up[j].indexOf('=');var kj=ej===-1?up[j]:up[j].substring(0,ej);if(kj&&!C.has(kj)){if(!(kj in pm))po.push(kj);pm[kj]=up[j];}}}}var m='?';for(var x=0;x<po.length;x++){if(x>0)m+='&';m+=pm[po[x]];}history.replaceState(null,'',window.location.pathname+window.location.search+'#'+m);})();</script>`;
    const modifiedHtml = indexHtml.replace(
      "</head>",
      injectedScript + "\n</head>",
    );

    return new Response(modifiedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Shortened URL error:", error);

    // Handle S3 NoSuchKey error (404)
    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      return c.json({ error: "Shortened URL not found" }, 404);
    }

    return c.json({ error: "Failed to retrieve shortened URL" }, 500);
  }
});

// Short URL metaframe.json — computes effective definition from stored hash params
app.get("/j/:sha256/metaframe.json", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "URL shortening not configured" }, 503);
  }

  try {
    const sha256 = c.req.param("sha256");

    if (!sha256 || !/^[a-f0-9]{64}$/.test(sha256)) {
      return c.json({ error: "Invalid shortened URL ID" }, 400);
    }

    const key = `j/${sha256}`;
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3PresignClient.send(command);
    if (!response.Body) throw new Error("S3 response body is empty");
    const hashParams = await response.Body.transformToString();

    const definition = computeMetaframeDefinition(hashParams);
    c.header("Cache-Control", "public, max-age=31536000, immutable");
    return c.json(definition);
  } catch (error: any) {
    console.error("Short URL metaframe.json error:", error);

    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      return c.json({ error: "Shortened URL not found" }, 404);
    }

    return c.json({ error: "Failed to retrieve shortened URL" }, 500);
  }
});

// Short URL JSON API — returns id and hashParams for a given sha256
app.get("/api/j/:sha256", async (c) => {
  if (!s3PresignClient) {
    return c.json({ error: "URL shortening not configured" }, 503);
  }

  try {
    const sha256 = c.req.param("sha256");

    if (!sha256 || !/^[a-f0-9]{64}$/.test(sha256)) {
      return c.json({ error: "Invalid shortened URL ID" }, 400);
    }

    const key = `j/${sha256}`;
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3PresignClient.send(command);
    if (!response.Body) throw new Error("S3 response body is empty");
    const hashParams = await response.Body.transformToString();

    c.header("Cache-Control", "public, max-age=31536000, immutable");
    return c.json({
      id: sha256,
      hashParams: decodeHashParamsToJson(hashParams),
    });
  } catch (error: any) {
    console.error("Short URL API error:", error);

    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      return c.json({ error: "Shortened URL not found" }, 404);
    }

    return c.json({ error: "Failed to retrieve shortened URL" }, 500);
  }
});

// File download endpoint — redirects to the public S3 URL
app.get("/f/:id", (c) => {
  if (!S3_PUBLIC_URL) {
    return c.json(
      { error: "File access not configured (missing S3_PUBLIC_URL)" },
      503,
    );
  }

  try {
    const id = c.req.param("id");
    const publicUrl = getPublicUrl(id);

    c.header("Cache-Control", "public, max-age=3600");
    return c.redirect(publicUrl);
  } catch (error) {
    console.error("File download error:", error);
    return c.json({ error: "Failed to redirect to file" }, 500);
  }
});

// Static file serving
app.use("/editor/*", serveStatic({ root: "./" }));
app.use("/docs/*", serveStatic({ root: "./" }));
app.use(
  "/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/static${path}`,
  }),
);

console.log(`🚀 Listening on: http://localhost:${port}`);
Deno.serve({ port }, app.fetch);
