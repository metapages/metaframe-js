---
description: Generate browser JavaScript and open it at framejs.io
argument-hint: "[short URL or sha256] [description of changes], or [description of what to create], with optional local file paths"
allowed-tools: Bash(node *), Read
---

<!-- GENERATED FILE — do not edit. Source of truth: worker/static/skill/framejs/ (regenerate with `just build-skill`). -->
<!-- Prefer the portable `framejs` Agent Skill: https://framejs.io/skill/framejs/SKILL.md -->

You generate JavaScript that runs at https://framejs.io — a hosted web app that
executes an ES6 module from the URL. The ONLY output you produce is the result
of running a node command that creates a short URL and opens it in the browser.

# USER REQUEST: $ARGUMENTS

`$ARGUMENTS` can be: (1) a description to create from scratch; (2) a short URL
(`https://framejs.io/j/<sha256>`) or bare 64-char hex id plus a change request —
fetch and modify the existing app; (3) local file paths to visualize — upload
and pass as inputs.

# HOW TO DELIVER (this is a standalone command — use the inline-node commands below)

ALWAYS deliver by creating a short URL and printing it. NEVER create HTML files,
NEVER write local .js files, NEVER output a code block for the user to copy, and
NEVER build a long URL with the code in the hash. On every update, create a NEW
short URL.

A framejs.io app is fully described by its hash params (`js`, optional
`modules`, `inputs`, `og`). The short-URL API stores those params server-side
and returns a clean `/j/<sha256>` link. Base URL is `https://framejs.io`
(override with `FRAMEJS_BASE` when using the helper script).

## Create a short URL

`POST /api/shorten/json` with a JSON body — the server handles all encoding:

```json
{
  "js": "raw JavaScript source (plain text)",
  "modules": ["https://cdn.example.com/classic-script.js"],
  "inputs": {
    "data.csv": { "type": "url", "value": "https://framejs.io/f/abc..." }
  },
  "og": { "title": "Short title", "description": "One-sentence summary" }
}
```

Only `js` is required. Response:

```json
{ "shortUrl": "https://framejs.io/j/<sha256>", "id": "<sha256>" }
```

The short URL is the primary output — **always print it**. Opening a browser is
best-effort and may fail in sandboxes. On every update/iteration, create a NEW
short URL.

### With the helper script

```bash
cat app.js | node scripts/framejs.mjs create \
  --title "Bouncing ball" \
  --description "A ball bouncing around the canvas with gravity" \
  --module https://3dmol.org/build/3Dmol-min.js
```

### Inline fallback (no bundled script)

Pipe code via a quoted heredoc so the shell performs NO expansion (`$`,
backticks, and backslashes pass through verbatim — never hold the code in a
template literal):

```bash
cat << 'JSCODE' | node -e "
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const body = {
    js: Buffer.concat(chunks).toString(),
    modules: [/* classic-script URLs, if any */],
    og: { title: 'SHORT TITLE', description: 'ONE-SENTENCE SUMMARY' }
  };
  fetch('https://framejs.io/api/shorten/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(data => {
    console.log(data.shortUrl);
    try {
      require('child_process').execSync(
        process.platform === 'darwin' ? 'open \"' + data.shortUrl + '\"'
        : process.platform === 'linux' ? 'xdg-open \"' + data.shortUrl + '\"'
        : 'cmd /c start \"\" \"' + data.shortUrl + '\"'
      );
    } catch(e) {}
  })
  .catch(e => console.error('Error:', e.message));
});
"
// YOUR GENERATED BROWSER JS CODE HERE — $vars, backticks, all special chars are safe inside the heredoc
JSCODE
```

## Open Graph preview tags (`og`) — always set when missing

The server renders `og:title` / `og:description` so the link unfurls with a
meaningful title and summary when shared (Slack, iMessage, social media). `og`
round-trips through the API exactly like `js` / `modules` / `inputs`.

- **New app:** ALWAYS include `og`, derived from the user's request and the code
  you generated (not placeholder text).
  - `title`: concise and specific, aim for ≤ ~60 characters (avoids truncation).
  - `description`: ~110–150 characters; say what it shows and, if interactive,
    how to use it.
- **Modifying an existing app:** if the fetched `hashParams.og` exists, carry it
  through UNCHANGED unless the user explicitly asks to change the copy. If it is
  missing, ADD one following the rules above. Never silently drop or overwrite
  an `og` the user (or a previous run) already set.

## Modify an existing short URL — fetch first

When the request includes a short URL (`https://framejs.io/j/<sha256>`) or a
bare 64-char hex id, you MUST fetch the existing app BEFORE generating code:

```bash
node scripts/framejs.mjs fetch <sha256>     # or: fetch https://framejs.io/j/<sha256>
# inline fallback:
node -e "fetch('https://framejs.io/api/j/<sha256>').then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)))"
```

`GET /api/j/<sha256>` returns:

```json
{
  "id": "<sha256>",
  "hashParams": { "js": "...", "inputs": {}, "modules": [], "og": {} }
}
```

- `js` is the EXISTING code — MODIFY it per the user's request; do NOT rewrite
  from scratch.
- Preserve `inputs` handling and `modules` unless the user asks to change them.
- Preserve `og` per the rules above.

Then re-create a new short URL with the modified body.

# LOCAL FILE INPUTS

When the request references local file paths (e.g. `./data.csv`,
`/tmp/results.json`), upload each file to framejs.io and pass them as `inputs`.
The result is a standalone, shareable app powered by the uploaded data — anyone
who opens the link sees the visualization with no local files needed.

## Step 1 — inspect the file

Read the file to understand its structure so you can generate appropriate
visualization code (column names, shape, types, etc.).

## Step 2 — upload each file

```bash
node scripts/framejs.mjs upload ./data/sales.csv
# → {"name":"sales.csv","url":"https://framejs.io/f/abc123...","contentType":"text/csv"}
```

The helper computes the SHA256, detects the content type from the extension,
gets a presigned URL from `POST /api/upload/presign`, and `PUT`s the bytes to
S3. Uploaded files are content-addressed (same bytes → same URL) and persist.

### Inline fallback

```bash
node -e "
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const filePath = '<LOCAL_FILE_PATH>';
const buf = fs.readFileSync(filePath);
const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
const ext = path.extname(filePath).toLowerCase();
const types = { '.json':'application/json', '.csv':'text/csv', '.tsv':'text/tab-separated-values', '.txt':'text/plain', '.xml':'text/xml', '.html':'text/html', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml', '.webp':'image/webp', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.mp4':'video/mp4', '.pdf':'application/pdf' };
const contentType = types[ext] || 'application/octet-stream';
fetch('https://framejs.io/api/upload/presign', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentType, fileSize: buf.length, sha256 }) })
  .then(r => r.json())
  .then(async ({ presignedUrl, canonicalPath }) => {
    await fetch(presignedUrl, { method:'PUT', headers:{'Content-Type':contentType}, body: buf });
    console.log(JSON.stringify({ name: path.basename(filePath), url: 'https://framejs.io' + canonicalPath, contentType }));
  })
  .catch(e => console.error(e));
"
```

## Step 3 — build the `inputs` object

Inputs are DataRef objects with `type` and `value`. For uploaded files use type
`url`:

```json
{
  "data.csv": { "type": "url", "value": "https://framejs.io/f/abc123..." },
  "config.json": { "type": "url", "value": "https://framejs.io/f/def456..." }
}
```

Pass `inputs` in the short-URL body alongside `js` (see `short-url-api.md`).
With the helper script:

```bash
cat app.js | node scripts/framejs.mjs create \
  --input 'data.csv={"type":"url","value":"https://framejs.io/f/abc123..."}' \
  --title "Sales dashboard" --description "Bar chart of monthly sales from the uploaded CSV"
```

## Step 4 — handle the resolved inputs in code

The runtime resolves URL DataRefs **before** calling `onInputs()`, based on the
file's Content-Type:

| Content-Type                | Value passed to `onInputs` |
| --------------------------- | -------------------------- |
| `application/json`          | parsed JSON object         |
| `text/*` (csv, tsv, xml, …) | plain string               |
| `image/*`                   | `Blob`                     |
| other                       | `Blob`                     |

Your code receives the RESOLVED data (not the URL). The input name must match
the key in the `inputs` object:

```js
export function onInputs(inputs) {
  const csvText = inputs["data.csv"]; // string (text/csv)
  const config = inputs["config.json"]; // parsed object (application/json)
  // render using the data
}
```

**Upload files BEFORE building the short URL** — you need the upload URLs to
populate `inputs`.

# BROWSER JAVASCRIPT CODING GUIDE

The code runs as an **ES6 module in the browser**, inside an iframe. It is NOT
Node.js — use browser APIs only. `"use strict"` is added automatically; do not
include it. Top-level `await` is supported.

## Critical constraints

- **MUST use ES6 module syntax** — exported handlers:
  - ✅ `export function onInputs(inputs) {}`
  - ✅ `export const onInputs = (inputs) => {}`
  - ❌ `function onInputs(inputs) {}` — missing `export`!
- **Never modify** `root.style.position`, `root.style.height`, or
  `root.style.width` — it breaks the editor layout. To size content, create a
  child `div` with `width:100%; height:100%` and style that instead.
- **Always clear** `root` before building DOM: `root.innerHTML = ""`.

## Pre-defined globals (no import needed)

```js
setOutput("outputName", value); // send one output
setOutputs({ out1: "val", out2: 42 }); // send multiple outputs
log("message"); // visual log — writes to the display
logStdout("message"); // stdout log
logStderr("error"); // stderr log
root; // the display div, already exists
root.innerHTML = "<h1>Hello</h1>";
root.getBoundingClientRect().width;
```

For graphical apps use `console.log()` (not `log()`, which writes to the
display).

Output value types: strings, numbers, booleans, objects, arrays, `ArrayBuffer`,
`Uint8Array`, and other typed arrays.

## Exports

```js
// Handle inputs (required)
export function onInputs(inputs) {
  const data = inputs["input.json"];
  render(data);
}

// Handle resize (optional but recommended)
export function onResize(width, height) {
  // Update visualization for new dimensions
}

// Cleanup (optional, for dev iterations)
export function cleanup() {
  // Remove listeners, clear intervals
}
```

## Common patterns

**Visualization** — build DOM once in the main script body, then update elements
in `onInputs` (do not recreate the DOM each time):

```js
root.innerHTML =
  `<div style="width:100%;height:100%"><h1 id="title">Title</h1></div>`;
export function onInputs(inputs) {
  document.getElementById("title").innerHTML = inputs["data"].title;
}
```

**Process and output:**

```js
export async function onInputs(inputs) {
  const processed = inputs["raw"].map((x) => x * 2);
  setOutput("result.json", processed);
}
```

**External libraries** — prefer ES6 imports from a CDN (`/+esm`):

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
d3.select(root).append("svg").attr("width", 500);
```

## Key details

- No need to wait for `DOMContentLoaded` — code runs after the page loads.
- `setOutput` is fire-and-forget (async, no return value).
- Prevent scroll propagation to the parent page when needed:

  ```js
  window.addEventListener("wheel", (e) => {
    if (myDiv.contains(e.target)) e.preventDefault();
  }, { passive: false });
  ```

- Persist state in the URL hash (portable, shareable):

  ```js
  import {
    getHashParamValueJsonFromWindow,
    setHashParamValueJsonInWindow,
  } from "https://cdn.jsdelivr.net/npm/@metapages/hash-query@0.10.0/+esm";

  setHashParamValueJsonInWindow("state", { zoom: 2 });
  const state = getHashParamValueJsonFromWindow("state");
  ```

## Common mistakes

- ❌ Creating an HTML file — never create HTML files.
- ❌ Writing a local `.js` file — never write files.
- ❌ `function onInputs(inputs) {}` — not exported.
- ❌ `root.appendChild(el)` before clearing — clear `root.innerHTML` first.
- ❌ Including `"use strict"` — added automatically.
- ❌ Changing `root.style.position` / `height` / `width`.
- ❌ Writing a Node.js script — this runs in the BROWSER.

## CDN libraries (use `/+esm` ES6 imports unless noted)

- **2D/3D plots:** Plotly (preferred)
  `import "https://cdn.plot.ly/plotly-3.3.0.min.js"`; d3
  `import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"`
- **2D plots:** echarts
  `import * as echarts from "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.esm.min.js"`
- **2D animation/easing:** gsap
  `import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm"`
- **Sound:** howler
  `import howler from "https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm"`; tone
  `import * as Tone from "https://cdn.jsdelivr.net/npm/tone@15.1.22/+esm"`
- **Creative/custom:** p5
  `import "https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js"`
- **2D physics:** matter
  `import Matter from "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm"`
- **3D objects/physics/rendering:** babylon
  `import "https://cdn.babylonjs.com/babylon.js"`

### Classic scripts (NOT ES6 — go in the `modules` array, not an import)

Some libraries are classic scripts that attach globals rather than ES6 modules.
Put their URLs in the `modules` array of the short-URL body (see
`short-url-api.md`) instead of `import`-ing them:

- 3Dmol.js: `https://3dmol.org/build/3Dmol-min.js`
