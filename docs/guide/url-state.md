# URL State

State is stored in the URL hash. You can get and set values using the [@metapages/hash-query](https://www.npmjs.com/package/@metapages/hash-query) module:

```javascript
import {
  getHashParamsFromWindow,
  getHashParamFromWindow,
  getHashParamValueJsonFromWindow,
  setHashParamValueJsonInWindow,
  setHashParamValueBase64EncodedInWindow,
  getHashParamValueBase64DecodedFromWindow,
  deleteHashParamFromWindow,
} from "https://cdn.jsdelivr.net/npm/@metapages/hash-query@0.10.0/+esm";

// Get JSON stored in URL
const myJsonBlob = getHashParamValueJsonFromWindow("someKey") || {};

// Update the JSON blob
myJsonBlob["someKey"] = "foobar";

// Set it back in the URL
setHashParamValueJsonInWindow("someKey", myJsonBlob);

// Delete it if needed
deleteHashParamFromWindow("someKey");
```

::: tip
This is designed for relatively small values. Large multi-megabyte JSON blobs are not yet supported.
:::

## The `css` hash param (transient global stylesheet)

The `css` hash param loads a global stylesheet at runtime. Its value is **base64-encoded** and is either:

- raw CSS text, which is injected as a `<style>` element, or
- a URL to a CSS stylesheet (a single-line `http(s)` URL), which is injected as a `<link rel="stylesheet">`.

Unlike the other hash params, `css` is **not persisted**: it is never written into the metaframe definition, copied into shareable links, or baked into [short URLs](/guide/short-urls). It is purely appended at runtime.

This makes it ideal for applying a consistent style across many different pieces of content **without modifying that content**. Because it is not part of a short URL's content, appending `#?css=…` to an existing short URL changes nothing about the underlying content — it just layers a stylesheet on top.

The value is encoded the same way as every other base64 hash param: `btoa(encodeURIComponent(text))` (the plain `btoa` alone is not enough — non-ASCII characters would corrupt).

```javascript
// Base64-encode raw CSS...
const css = btoa(encodeURIComponent("body { background: #111; color: #eee; }"));
location.hash = "?css=" + css;

// ...or base64-encode a stylesheet URL
const css = btoa(encodeURIComponent("https://example.com/theme.css"));
location.hash = "?css=" + css;
```

Appended to a short URL: `https://framejs.io/j/<id>#?css=<base64>`

::: tip
Clearing or changing the `css` param replaces the previously injected stylesheet, so you can swap themes live by updating the param.
:::
