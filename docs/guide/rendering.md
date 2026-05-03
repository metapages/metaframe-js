# Rendering in a Website

You can render any metaframe-js widget directly in your own website using the `@metapages/metapage` npm package. This gives you full I/O control — send inputs into the metaframe and receive outputs from it — along with lifecycle management, no manual iframe wiring needed.

This is the key advantage over a plain iframe embed: you get a programmatic interface to **send data in** and **get data out** of the running metaframe.

## Install

```bash
npm install @metapages/metapage
```

## Usage

```javascript
import { renderMetaframe } from "@metapages/metapage";

const { setInputs, dispose } = await renderMetaframe({
  onOutputs: (outputs) => {
    console.log("Got outputs", outputs);
  },
  url: "https://js.mtfm.io/",
  rootDiv: document.getElementById("container"),
});
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The metaframe URL to render |
| `rootDiv` | `HTMLElement` | The DOM element to render into |
| `onOutputs` | `(outputs) => void` | Callback fired when the metaframe sends outputs |

### Return value

| Property | Type | Description |
|----------|------|-------------|
| `setInputs` | `(inputs) => void` | Send inputs to the metaframe |
| `dispose` | `() => void` | Remove the metaframe and clean up resources |

## Example

```html
<div id="container" style="width: 600px; height: 400px;"></div>

<script type="module">
  import { renderMetaframe } from "@metapages/metapage";

  const { setInputs, dispose } = await renderMetaframe({
    // OUTPUT: receive data from the metaframe
    onOutputs: (outputs) => {
      console.log("Got outputs", outputs);
      // Use outputs in your app — update state, call APIs, etc.
    },
    url: "https://js.mtfm.io/#?hm=disabled&editurl=https://js.mtfm.io/",
    rootDiv: document.getElementById("container"),
  });

  // INPUT: send data into the metaframe
  setInputs({ myInput: "hello" });

  // Later, clean up
  // dispose();
</script>
```

See the [@metapages/metapage npm package](https://www.npmjs.com/package/@metapages/metapage) for full documentation.
