import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import {
  Application,
  Context,
  Router,
} from "https://deno.land/x/oak@v10.2.0/mod.ts";
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts";
import { MetaframeDefinition } from "https://esm.sh/@metapages/metapage@1.10.3";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

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
      console.log(
        `S3 presign client configured: endpoint=${S3_ENDPOINT}`,
      );
    }
  }
}

const DEFAULT_METAFRAME_DEFINITION: MetaframeDefinition = {
  metadata: {
    name: "Javascript code runner",
    tags: ["javascript", "code", "js"],
  },
  inputs: {},
  outputs: {},
  hashParams: {
    bgColor: {
      type: "string",
      description: "The background color of the metaframe",
      label: "Background Color",
    },
    definition: {
      type: "json",
      description: "The definition of the metaframe",
      label: "Definition",
    },
    edit: {
      type: "boolean",
      description: "Whether the metaframe is in edit mode",
      label: "Edit",
    },
    editorWidth: {
      type: "string",
      description:
        "The width of the editor, in valid CSS. If no units are provided, 'ch' is assumed.",
      label: "Editor Width",
    },
    hm: {
      type: "string",
      description:
        "The visibility of the menu button. 'disabled' to hide, 'invisible' to hide until hover, 'visible' to show always.",
      label: "Menu Button Visibility",
      allowedValues: ["disabled", "invisible", "visible"],
    },
    inputs: {
      type: "json",
      description:
        "The inputs of the metaframe. This is a JSON object with the input name as the key and the value as a dataref object. Datarefs are objects with a 'type' property and a 'value' property. The 'type' property is a string that can be one of 'base64', 'utf8', 'json', 'url', or 'key'. The 'value' property is a string or object depending on the type.",
      label: "Inputs",
    },
    js: {
      type: "stringBase64",
      description:
        "The JavaScript code to run in the metaframe. This is a base64 encoded string of the JavaScript code. Encoding is btoa(encodeURIComponent(value)), decoding is the reverse.",
      label: "JavaScript Code",
    },
    modules: {
      type: "json",
      description:
        "The modules of the metaframe. This is a JSON array of strings, each string being a module or css URL. This is deprecated, use es6 imports in the javascript directly.",
      label: "Modules or CSS URLs",
    },
    options: {
      type: "json",
      description:
        "The options of the metaframe. This is a JSON object with the option name as the key and the value as a string or boolean. The options are used to configure the metaframe. The options are: 'debug', 'disableCache', 'disableDatarefs', 'disableSmartInputUnpacking'.",
      label: "Options",
      allowedValues: [
        "debug",
        "disableCache",
        "disableDatarefs",
        "disableSmartInputUnpacking",
      ],
    },
  },
  allow: "clipboard-write",
};

const DEFAULT_METAFRAME_DEFINITION_STRING = JSON.stringify(
  DEFAULT_METAFRAME_DEFINITION,
  null,
  2,
);

// const certFile = "../.certs/server1.localhost.pem",
//   keyFile = "../.certs/server1.localhost-key.pem";

const router = new Router();

const serveIndex = async (ctx: Context) => {
  const indexHtml = await Deno.readTextFile("./index.html");
  ctx.response.body = indexHtml;
};

const serveServiceWorker = async (ctx: Context) => {
  try {
    const swJs = await Deno.readTextFile("./sw.js");
    ctx.response.headers.set("Content-Type", "application/javascript");
    ctx.response.headers.set("Service-Worker-Allowed", "/");
    ctx.response.body = swJs;
  } catch (error) {
    console.error("Error serving service worker:", error);
    ctx.response.status = 404;
    ctx.response.body = "Service worker not found";
  }
};

const serveCacheTestUtils = async (ctx: Context) => {
  try {
    const testUtilsJs = await Deno.readTextFile("./cache-test-utils.js");
    ctx.response.headers.set("Content-Type", "application/javascript");
    ctx.response.headers.set("Cache-Control", "no-cache"); // Don't cache test utilities
    ctx.response.body = testUtilsJs;
  } catch (error) {
    console.error("Error serving cache test utilities:", error);
    ctx.response.status = 404;
    ctx.response.body = "Cache test utilities not found";
  }
};

router.get("/", serveIndex);
router.get("/index.html", serveIndex);
router.get("/sw.js", serveServiceWorker);
router.get("/cache-test-utils.js", serveCacheTestUtils);
router.get("/metaframe.json", (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "application/json");
  ctx.response.body = DEFAULT_METAFRAME_DEFINITION_STRING;
});
router.get("/editor/metaframe.json", (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "application/json");
  ctx.response.body = DEFAULT_METAFRAME_DEFINITION_STRING;
});
// Upload presign endpoint — returns a presigned URL for direct browser-to-S3 upload
router.post("/api/upload/presign", async (ctx: Context) => {
  if (!s3PresignClient) {
    ctx.response.status = 503;
    ctx.response.body = { error: "File upload not configured" };
    return;
  }

  try {
    const body = await (ctx.request as any).body({ type: "json" }).value;
    const { contentType, fileSize, sha256 } = body;

    if (!contentType) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required field: contentType" };
      return;
    }

    if (fileSize && fileSize > S3_UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: `File too large. Max size: ${S3_UPLOAD_MAX_SIZE_MB}MB`,
      };
      return;
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

    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = JSON.stringify({
      presignedUrl,
      canonicalPath,
      key,
      id,
    });
  } catch (error) {
    console.error("Presign error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to generate presigned URL" };
  }
});

// URL shortening endpoint — stores hash params in S3
router.post("/api/shorten", async (ctx: any) => {
  if (!s3PresignClient) {
    ctx.response.status = 503;
    ctx.response.body = { error: "URL shortening not configured" };
    return;
  }

  try {
    const body = await (ctx.request as any).body({ type: "json" }).value;
    const { hashParams } = body;

    if (!hashParams) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Missing required field: hashParams",
      };
      return;
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

    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = JSON.stringify({
      success: true,
      id: sha256,
      path: `/j/${sha256}`,
    });
  } catch (error) {
    console.error("Shorten URL error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to shorten URL" };
  }
});

// Shortened URL redirect — fetches hash params from S3 and redirects
router.get("/j/:sha256", async (ctx: any) => {
  if (!s3PresignClient) {
    ctx.response.status = 503;
    ctx.response.body = { error: "URL shortening not configured" };
    return;
  }

  try {
    const { sha256 } = ctx.params;

    // Validate sha256 format (64 hex characters)
    if (!sha256 || !/^[a-f0-9]{64}$/.test(sha256)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid shortened URL ID" };
      return;
    }

    const key = `j/${sha256}`;

    // Fetch from S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3PresignClient.send(command);

    // Read body stream as string
    const hashParams = await response.Body.transformToString();

    // Construct origin from request headers
    const protocol = ctx.request.headers.get("x-forwarded-proto") || "https";
    const host = ctx.request.headers.get("host");
    const origin = `${protocol}://${host}`;

    // Redirect to origin with hash params
    const redirectUrl = `${origin}/#${hashParams}`;

    ctx.response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    ctx.response.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Shortened URL redirect error:", error);

    // Handle S3 NoSuchKey error (404)
    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      ctx.response.status = 404;
      ctx.response.body = { error: "Shortened URL not found" };
      return;
    }

    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to retrieve shortened URL" };
  }
});

// File download endpoint — redirects to the public S3 URL
router.get("/f/:id", async (ctx: any) => {
  if (!S3_PUBLIC_URL) {
    ctx.response.status = 503;
    ctx.response.body = {
      error: "File access not configured (missing S3_PUBLIC_URL)",
    };
    return;
  }

  try {
    const { id } = ctx.params;
    // Construct the public S3 URL: bucket is already in the S3_PUBLIC_URL path
    const publicUrl = getPublicUrl(id);

    ctx.response.headers.set("Cache-Control", "public, max-age=3600");
    ctx.response.redirect(publicUrl);
  } catch (error) {
    console.error("File download error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to redirect to file" };
  }
});

// After creating the router, we can add it to the app.

const app = new Application();
app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `🚀 Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`,
  );
});
app.use(oakCors({ origin: "*" }));
app.use(
  staticFiles("static", {
    setHeaders: (headers: Headers) => {
      headers.set("Access-Control-Allow-Origin", "*");
    },
  }),
);
app.use(
  staticFiles("editor", {
    prefix: "/editor",
    setHeaders: (headers: Headers) => {
      headers.set("Access-Control-Allow-Origin", "*");
    },
  }),
);
app.use(router.routes());
app.use(router.allowedMethods());

// await app.listen({ port, certFile, keyFile });
await app.listen({ port });
