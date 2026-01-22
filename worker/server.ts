import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';
import {
  Application,
  Context,
  Router,
} from 'https://deno.land/x/oak@v10.2.0/mod.ts';
import staticFiles from 'https://deno.land/x/static_files@1.1.6/mod.ts';
import {
  MetaframeDefinitionV2,
  MetaframeVersionCurrent,
} from 'https://esm.sh/@metapages/metapage@1.9.2';

const port: number = parseInt(Deno.env.get("PORT") || "3000");

const DEFAULT_METAFRAME_DEFINITION: MetaframeDefinitionV2 = {
  version: MetaframeVersionCurrent,
  metadata: {
    name: "Javascript code runner",
    tags: ["javascript", "code", "js"],
  },
  inputs: {},
  outputs: {},
  hashParams: {
    "bgColor": {
      type: "string",
      description: "The background color of the metaframe",
      label: "Background Color",
    },
    "definition" : {
      type: "json",
      description: "The definition of the metaframe",
      label: "Definition",
    },
    "edit": {
      type: "boolean",
      description: "Whether the metaframe is in edit mode",
      label: "Edit",
    },
    "editorWidth" : {
      type: "string",
      description: "The width of the editor, in valid CSS. If no units are provided, 'ch' is assumed.",
      label: "Editor Width",
    },
    "hm": {
      type: "string",
      description: "The visibility of the menu button. 'disabled' to hide, 'invisible' to hide until hover, 'visible' to show always.",
      label: "Menu Button Visibility",
      allowedValues: ["disabled", "invisible", "visible"],
    },
    "inputs": {
      type: "json",
      description: "The inputs of the metaframe. This is a JSON object with the input name as the key and the value as a dataref object. Datarefs are objects with a 'type' property and a 'value' property. The 'type' property is a string that can be one of 'base64', 'utf8', 'json', 'url', or 'key'. The 'value' property is a string or object depending on the type.",
      label: "Inputs",
    },
    "js": {
      type: "stringBase64",
      description: "The JavaScript code to run in the metaframe. This is a base64 encoded string of the JavaScript code. Encoding is btoa(encodeURIComponent(value)), decoding is the reverse.",
      label: "JavaScript Code",
    },
    "modules": {
      type: "json",
      description: "The modules of the metaframe. This is a JSON array of strings, each string being a module or css URL. This is deprecated, use es6 imports in the javascript directly.",
      label: "Modules or CSS URLs",
    },
    "options": {
      type: "json",
      description: "The options of the metaframe. This is a JSON object with the option name as the key and the value as a string or boolean. The options are used to configure the metaframe. The options are: 'debug', 'disableCache', 'disableDatarefs', 'disableSmartInputUnpacking'.",
      label: "Options",
      allowedValues: ["debug", "disableCache", "disableDatarefs", "disableSmartInputUnpacking"],
    },
  },
  allow: "clipboard-write",
};

const DEFAULT_METAFRAME_DEFINITION_STRING = JSON.stringify(
  DEFAULT_METAFRAME_DEFINITION,
  null,
  2
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
// After creating the router, we can add it to the app.

const app = new Application();
app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `🚀 Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`
  );
});
app.use(oakCors({ origin: "*" }));
app.use(
  staticFiles("static", {
    setHeaders: (headers: Headers) => {
      headers.set("Access-Control-Allow-Origin", "*");
    },
  })
);
app.use(
  staticFiles("editor", {
    prefix: "/editor",
    setHeaders: (headers: Headers) => {
      headers.set("Access-Control-Allow-Origin", "*");
    },
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

// await app.listen({ port, certFile, keyFile });
await app.listen({ port });
