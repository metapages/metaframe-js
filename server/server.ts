import { serve } from "https://deno.land/std@0.151.0/http/server.ts";
import { LRU } from "https://deno.land/x/lru@1.0.2/mod.ts";
// MANUALLY COPYING FOR NOW HOW UGH
// import { Config, urlToConfig } from "../client/src/shared/config.ts";
// https://github.com/denoland/deploy_feedback/issues/264
// Shared between client and server

export interface Config {
  modules: string[];
}

interface UrlEncodedConfigV1 {
  modules: string[];
}

export const urlToConfig = (url: URL) : Config => {
  const version :string | null = url.searchParams.get("v");
  const encodedConfigString :string | null = url.searchParams.get("c");
  if (!version || !encodedConfigString) {
      return {modules: []};
  }
  switch(version) {
      case "1":
          return urlTokenV1ToConfig(encodedConfigString);
      default:
          return {modules: []};
  }
}

export const configToUrl = (url:URL, config: Config) : URL => {
  // On new versions, this will need conversion logic
  url.searchParams.set("v", "1");
  url.searchParams.set("c", btoa(JSON.stringify(config)));
  return url;
}

const urlTokenV1ToConfig = (encoded: string) : Config => {
  const configV1: UrlEncodedConfigV1 = JSON.parse(atob(encoded));
  // No need to case because it's the same FOR NOW
  return configV1;
}




const CACHE = new LRU<string>(500); // define your max amount of entries, in this example is 500

const HTML_TEMPLATE = [
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Metaframe JS</title>
`,
  `
  <script>
  const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor

  const execJsCode = (code, context) => {
    let exec = null
    let args = Object.keys(context)
    try {
        exec = AsyncFunction('exports', \`"use strict"; return (async function(\${args.join(', ')}){\${code}})\`)({})
    } catch (e) {
        return Promise.resolve({ failure: { error: e, phase: 'compile' } })
    }

    if (exec) {
        var phase = 'exec'
        let values = Object.values(context);
        if (exec.apply) {
            return exec.apply(null, values)
            .then((r) => ({ result: r }))
            .catch((e) => ({ failure: { error: e, phase } }))
        } else {
            return exec.then((a) => {
                return a.apply(null, values);
            })
            .then((r) => ({ result: r,  }))
            .catch((e) => ({ failure: { error: e, phase } }))
        }
    }

    return Promise.resolve({ failure: { error: 'compile failed', phase: 'compile' } })
  }

  const getUrlHashParamsFromHashString = (
    hash
  ) => {
    let hashString = hash;
    while (hashString.startsWith("#")) {
      hashString = hashString.substring(1);
    }

    const queryIndex = hashString.indexOf("?");
    if (queryIndex === -1) {
      return [hashString, {}];
    }
    const preHashString = hashString.substring(0, queryIndex);
    hashString = hashString.substring(queryIndex + 1);
    const hashObject = {};
    hashString
      .split("&")
      .filter((s) => s.length > 0)
      .map((s) => {
        const dividerIndex = s.indexOf("=");
        if (dividerIndex === -1) {
          return [s, ""];
        }
        const key = s.substring(0, dividerIndex);
        const value = s.substring(dividerIndex + 1);
        return [key, value];
      })
      .forEach(([key, value]) => {
        hashObject[key] = value;
      });

    Object.keys(hashObject).forEach(
      (key) => (hashObject[key] = decodeURI(hashObject[key]))
    );
    return [preHashString, hashObject];
  };
  </script>
  </head>
  <body>
    <div id="root"></div>

`,
  `<script>
    const [prefix, hashParams] = getUrlHashParamsFromHashString(window.location.hash);
    if (hashParams.js) {
      (async () => {
        const result = await execJsCode(hashParams.js, {});
        if (result.failure) {
          document.getElementById("root").innerHTML = \`<div>Error running code:\n\n\${result.failure.error}\n</div>\`;
        }
      })();
    }
  </script>`,
  `
</body>

</html>
`,
];

const handler = (request: Request): Response => {
  const url = new URL(request.url);
  if (url.pathname === "/healthz") {
    return new Response("OK", { status: 200 });
  }

  if (url.pathname.endsWith("/metaframe.json")) {
    const response = new Response(
      JSON.stringify(
        {
          version: "0.3",
          metadata: {
            title: "Javascript code runner",
          },
          inputs: {},
          outputs: {},
        },
        null,
        "  "
      ),
      { status: 200 }
    );
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Content-Type", "application/json");
    return response;
  }

  if (CACHE.get(url.href)) {
    const cachedBody: string = CACHE.get(url.href)!;
    const response = new Response(cachedBody, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Content-Type", "text/html");
    return response;
  }

  const template = [...HTML_TEMPLATE];
  try {
    const config: Config = urlToConfig(url);
    template[0] =
      template[0] +
      config.modules.map((m) => `<script src="${m}"></script>`).join("\n");
  } catch (err) {
    // err
    template[2] = `<div>Error parsing URL config:\n\n${err}\n</div>`;
  }

  const body = template.join("\n");
  CACHE.set(url.href, body);

  const response = new Response(body, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Content-Type", "text/html");
  return response;
};

console.log(`HTTP webserver running: http://localhost:8000/`);
await serve(handler, { port: 8000 });
