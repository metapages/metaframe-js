#!/usr/bin/env node
// framejs.mjs — helper for the `framejs` Agent Skill.
//
// Self-contained Node (v18+). No dependencies. Talks to the framejs.io API to:
//   create   read JS from stdin, create a short URL, print it, open the browser
//   fetch    retrieve the stored code/inputs/modules/og for an existing short URL
//   upload   upload a local file and print its public DataRef URL
//
// Base URL defaults to https://framejs.io; override with FRAMEJS_BASE.
//
// Examples:
//   cat app.js | node framejs.mjs create --title "Bouncing ball" --description "A ball bouncing in the canvas"
//   cat app.js | node framejs.mjs create --og '{"title":"...","description":"...","image":"..."}'  # preserve fetched og verbatim
//   node framejs.mjs fetch 8a3b1c...   # prints { id, hashParams: { js, inputs, modules, og } }
//   node framejs.mjs upload ./data.csv # prints { name, url, contentType }

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";

const BASE = (process.env.FRAMEJS_BASE || "https://framejs.io").replace(
  /\/+$/,
  "",
);

// Identifies this client (the framejs Agent Skill) to the server so usage from
// AI agents can be distinguished from web-editor traffic in analytics.
const CLIENT_TAG = "skill/1.0";

const CONTENT_TYPES = {
  ".json": "application/json",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".txt": "text/plain",
  ".xml": "text/xml",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

function die(msg) {
  console.error(`framejs: ${msg}`);
  process.exit(1);
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on(
      "end",
      () => resolve(Buffer.concat(chunks).toString("utf8")),
    );
  });
}

function openInBrowser(url) {
  try {
    const cmd = process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "linux"
      ? `xdg-open "${url}"`
      : `cmd /c start "" "${url}"`;
    execSync(cmd, { stdio: "ignore" });
  } catch {
    // Browser open is best-effort — the printed URL is the primary output.
  }
}

// Parse `--flag value`, repeatable `--module`, and `--input name=value` pairs.
function parseFlags(argv) {
  const flags = { modules: [], inputs: {}, open: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-open") flags.open = false;
    else if (a === "--module") flags.modules.push(argv[++i]);
    else if (a === "--title") flags.title = argv[++i];
    else if (a === "--description") flags.description = argv[++i];
    else if (a === "--og") {
      const raw = argv[++i] || "";
      try {
        flags.og = JSON.parse(raw);
      } catch {
        die(`--og expects a JSON object string, got "${raw}"`);
      }
    } else if (a === "--inputs") {
      Object.assign(flags.inputs, JSON.parse(readFileSync(argv[++i], "utf8")));
    } else if (a === "--input") {
      const pair = argv[++i] || "";
      const eq = pair.indexOf("=");
      if (eq === -1) die(`--input expects name=value, got "${pair}"`);
      const name = pair.slice(0, eq);
      const raw = pair.slice(eq + 1);
      let value;
      try {
        value = JSON.parse(raw);
      } catch {
        value = raw; // plain string
      }
      flags.inputs[name] = value;
    } else die(`unknown flag "${a}"`);
  }
  return flags;
}

async function cmdCreate(argv) {
  const flags = parseFlags(argv);
  const code = await readStdin();
  if (!code.trim()) die("no JavaScript on stdin (pipe the code into `create`)");

  const body = { js: code };
  if (flags.modules.length) body.modules = flags.modules;
  if (Object.keys(flags.inputs).length) body.inputs = flags.inputs;
  // `--og` carries a full og object through verbatim (incl. `image`) — use it
  // when MODIFYING an app to preserve the existing og without recalculating.
  // `--title`/`--description` build a fresh og and are only a fallback.
  if (flags.og !== undefined) {
    body.og = flags.og;
  } else if (flags.title || flags.description) {
    body.og = {
      title: flags.title || "",
      description: flags.description || "",
    };
  }

  const res = await fetch(`${BASE}/api/shorten/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Framejs-Client": CLIENT_TAG,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) die(`shorten failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log(data.shortUrl);
  if (flags.open) openInBrowser(data.shortUrl);
}

async function cmdFetch(argv) {
  const id = (argv[0] || "").replace(/^.*\/j\//, "");
  if (!/^[0-9a-f]{64}$/i.test(id)) {
    die("fetch expects a sha256 id or /j/<sha256> URL");
  }
  const res = await fetch(`${BASE}/api/j/${id}`, {
    headers: { "X-Framejs-Client": CLIENT_TAG },
  });
  if (!res.ok) die(`fetch failed: ${res.status} ${await res.text()}`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

async function cmdUpload(argv) {
  const filePath = argv[0];
  if (!filePath) die("upload expects a file path");
  const buf = readFileSync(filePath);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()] ||
    "application/octet-stream";

  const presignRes = await fetch(`${BASE}/api/upload/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Framejs-Client": CLIENT_TAG,
    },
    body: JSON.stringify({ contentType, fileSize: buf.length, sha256 }),
  });
  if (!presignRes.ok) {
    die(`presign failed: ${presignRes.status} ${await presignRes.text()}`);
  }
  const { presignedUrl, canonicalPath } = await presignRes.json();

  const putRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buf,
  });
  if (!putRes.ok) die(`upload failed: ${putRes.status} ${await putRes.text()}`);

  console.log(
    JSON.stringify({
      name: basename(filePath),
      url: `${BASE}${canonicalPath}`,
      contentType,
    }),
  );
}

const [cmd, ...rest] = process.argv.slice(2);
const handlers = { create: cmdCreate, fetch: cmdFetch, upload: cmdUpload };
if (!handlers[cmd]) {
  die(
    `usage: framejs.mjs <create|fetch|upload> [...]\n  create  (reads JS from stdin)  --module <url> --input name=value --inputs <file.json> --title <t> --description <d> --og <json> --no-open\n  fetch   <sha256 | /j/sha256>\n  upload  <file-path>`,
  );
}
handlers[cmd](rest).catch((e) => die(e?.message || String(e)));
