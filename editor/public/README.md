# Javascript embedded in the URL: run and edit 

Edit and run javascript code in the browser. Share and connect the self-contained websites with other chunks of code and visualization.

### Longer description

Run arbitrary user javascript modules embedded in the URL. Designed for [metapages](https://metapage.io) so you can connect inputs + outputs to other metaframe URLs.

## Javascript high level

 - code is an es6 module 
 - top-level `await`
 - export a function `onInputs` to listen to inputs
 - send outputs with `setOutput`/`setOutputs` (predefined functions available in your module)
 - export a function `onResize` to listen to window/div resizes
 - use es6 module imports, or add any css / npm modules to the page, they are embedded in the URL

## Useful code snippets

### Handling Inputs and outputs in code

Simply export a function (arrow function also good 👍) called `onInputs`:

```javascript
// regular js function
export function onInputs(inputs) {
  // do something here
  // inputs is a plain object (key and values)
}
//  OR arrow function
export const onInputs = (inputs) => {
  // do something here
  // inputs is a plain object (key and values)
}
```

To send outputs, there are two functions in the scope `setOutput` and `setOutputs`:

```javascript
// send a single JSON output
setOutput("outputname", 42);

// send an output object of keys+values
setOutputs({
  outputname:true,
  someOtherOutputName: "bar",
});
```

Output values can be strings, JSON, objects, arrays, numbers, ArrayBuffers, typed arrays such as `Uint8Array`;

### Define Inputs and Outputs

In `Settings` you can define inputs and outputs. This doesn't change how the code runs, but it allows much easier connecting upstream and downstream metaframes when editing [metapages](https://metapage.io).

In this example, we defined an input: `input.json` and an output `data.csv`:

![inputs](/editor/readme-images/io.png "Inputs and outputs defined in Settings")

You will see these inputs and outputs automatically in the metapage editor.

### The root display div element is exposed in the scope

The root display div is exposed in the script scope: the name is `root` and the id is also `root`:

```javascript
console.log(root.id)
// logs "root"
// Add any custom dome elements into "root".
```

You can also just get it with:
```javascript
document.getElementById("root")
```

### Height / width / window resize

To get the root element width/height:

```javascript
const width = root.getBoundingClientRect().width;
const height = root.getBoundingClientRect().height;
```


For automatically resizing: export a function (arrow function also good 👍) called `onResize`. This will be called when either the window resizes event and/or the local `div` element resizes:

```javascript
// regular js function
export function onResize(width, height) {
  // Your own code here, handling the resize of the root div
}
//  OR arrow function
export const onResize = (width, height) => {
  // Your own code here, handling the resize of the root div
}
```

### Prevent scroll events from propagating to the parent window

Often if you use (wheel) scroll events to interact with content, the event is also propagated to the parent window, scrolling the entire metapage, which is almost always undesired.

To prevent this, on the dom element you intercept wheel scroll events, add this code to prevent the event from propagating up. Replace `myContainer` with your dom element:

```javascript
// prevent parent from scrolling when zooming
function maybeScroll(event) {
  if (myContainer.contains(event.target)) {
    event.preventDefault();
  } 
}
window.addEventListener('wheel', maybeScroll, {passive: false})
```

### Unload/cleanup

When iterating with the code editor, the script is re-run. In some cases, this can cause problems as multiple listeners maybe responding to the same event.

This is not an issue when simply running the page once with code, only when develping iteratively.

To have your script cleaned up because of new script (when editing), declare a function `cleanup`, this will be called prior to the updated script re-running:

```javascript
// regular js function
export function cleanup() {
	console.log("internal scriptUnload call")
	// do your cleanup here
}
// OR arrow function
export const cleanup = () => {
  // do your cleanup here
}
```

### Wait until page `load`

You don't need to wait for the `load` event: your script will not run until `load` event fires.

### Logging to the display (instead of console)

Some globally available functions for logging:

```javascript

  log("something here");
  logStdout("something here");
  logStderr("an error");

```

These will be added to the root div (see below) so if your own code manipulates the root div, it could be overwritten. This is mostly useful for headless code.

### Misc

 - `"use strict"` is automatically added to the top of the module code.

## Connect upstream/downstream metaframes

[![](https://mermaid.ink/svg/pako:eNqFkU9LxDAQxb9KiJcVuqC9KBG8uN7sRT1JL2MzaYP5RzJhle1-d9NWd1HBnVMm770fw8yOd14iF7yPEAb28Ng6VqozkNIGFbPhzhsfmdLGiLPrK3mhVJUo-jf81a63WtIg6vB-szBSfl2gFgkC9Lh8T2VQ0eUqh5JEsLNBRbB4ztbr21G7kCmNrFk9Dzqx5qAKIb7m-YmqT6OOgWYS2OgzLVLU_VCGkX7r_jBOpOr_Uuhk63jFLUYLWpYV7yah5TSgxZaL8pSoIBtqeev2xZqDBMJ7qclHLhSYhBWHTP7pw3VcUMz4bdpoKMu1B1cA9-L9sccZ0iy3nU-8_wSxOqSj)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNqFkU9LxDAQxb9KiJcVuqC9KBG8uN7sRT1JL2MzaYP5RzJhle1-d9NWd1HBnVMm770fw8yOd14iF7yPEAb28Ng6VqozkNIGFbPhzhsfmdLGiLPrK3mhVJUo-jf81a63WtIg6vB-szBSfl2gFgkC9Lh8T2VQ0eUqh5JEsLNBRbB4ztbr21G7kCmNrFk9Dzqx5qAKIb7m-YmqT6OOgWYS2OgzLVLU_VCGkX7r_jBOpOr_Uuhk63jFLUYLWpYV7yah5TSgxZaL8pSoIBtqeev2xZqDBMJ7qclHLhSYhBWHTP7pw3VcUMz4bdpoKMu1B1cA9-L9sccZ0iy3nU-8_wSxOqSj)


## Examples

  - [Rotate stick on canvas from incoming angles](https://app.metapages.org/#?definition=JTdCJTIybWV0YSUyMiUzQSU3QiUyMmxheW91dHMlMjIlM0ElN0IlMjJyZWFjdC1ncmlkLWxheW91dCUyMiUzQSU3QiUyMmRvY3MlMjIlM0ElMjJodHRwcyUzQSUyRiUyRnd3dy5ucG1qcy5jb20lMkZwYWNrYWdlJTJGcmVhY3QtZ3JpZC1sYXlvdXQlMjIlMkMlMjJsYXlvdXQlMjIlM0ElNUIlN0IlMjJoJTIyJTNBMyUyQyUyMmklMjIlM0ElMjJyYW5kb20tZGF0YSUyMiUyQyUyMm1vdmVkJTIyJTNBZmFsc2UlMkMlMjJzdGF0aWMlMjIlM0FmYWxzZSUyQyUyMnclMjIlM0E1JTJDJTIyeCUyMiUzQTAlMkMlMjJ5JTIyJTNBMCU3RCUyQyU3QiUyMmglMjIlM0EzJTJDJTIyaSUyMiUzQSUyMnN0aWNrJTIyJTJDJTIybW92ZWQlMjIlM0FmYWxzZSUyQyUyMnN0YXRpYyUyMiUzQWZhbHNlJTJDJTIydyUyMiUzQTclMkMlMjJ4JTIyJTNBNSUyQyUyMnklMjIlM0EwJTdEJTVEJTJDJTIycHJvcHMlMjIlM0ElN0IlMjJjb2xzJTIyJTNBMTIlMkMlMjJjb250YWluZXJQYWRkaW5nJTIyJTNBJTVCNSUyQzUlNUQlMkMlMjJtYXJnaW4lMjIlM0ElNUIxMCUyQzIwJTVEJTJDJTIycm93SGVpZ2h0JTIyJTNBMTAwJTdEJTdEJTdEJTdEJTJDJTIybWV0YWZyYW1lcyUyMiUzQSU3QiUyMnJhbmRvbS1kYXRhJTIyJTNBJTdCJTIydXJsJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZyYW5kb20ubXRmbS5pbyUyRiUyMyUzRmRpc3RyaWJ1dGlvbiUzRGV5SmthWE4wY21saWRYUnBiMjRpT2lKemFXNGlMQ0ptY21WeGRXVnVZM2tpT2pFd0xDSnZjSFJwYjI1eklqcDdJbWx1WTNKbGJXVnVkQ0k2TUM0eGZTd2ljMmh2ZDA5MWRIQjFkQ0k2Wm1Gc2MyVjklMjIlN0QlMkMlMjJzdGljayUyMiUzQSU3QiUyMmlucHV0cyUyMiUzQSU1QiU3QiUyMm1ldGFmcmFtZSUyMiUzQSUyMnJhbmRvbS1kYXRhJTIyJTJDJTIyc291cmNlJTIyJTNBJTIydiUyMiUyQyUyMnRhcmdldCUyMiUzQSUyMnklMjIlN0QlNUQlMkMlMjJ1cmwlMjIlM0ElMjJodHRwcyUzQSUyRiUyRmpzLm10Zm0uaW8lMkYlMjMlM0ZlZGl0JTNEMSUyNmpzJTNEWTI5dWMzUWxNakJrYVhOd2IzTmxjbk1sTWpBbE0wUWxNakFsTlVJbE5VUWxNMElsTUVGamIyNXpkQ1V5TUhKdmIzUWxNakFsTTBRbE1qQmtiMk4xYldWdWRDNW5aWFJGYkdWdFpXNTBRbmxKWkNnbE1qSnliMjkwSlRJeUtTVXpRaVV3UVNVd1FTVXlSaVV5UmlVeU1ISmxibVJsY2lVeU1IUm9aU1V5TUdGdVoyeGxKVEJCZG1GeUpUSXdZMkZ1ZG1GekpUSXdKVE5FSlRJd1pHOWpkVzFsYm5RdVkzSmxZWFJsUld4bGJXVnVkQ2dsTWpKallXNTJZWE1sTWpJcEpUTkNKVEJCWTJGdWRtRnpMbmRwWkhSb0pUSXdKVE5FSlRJd01qQXdKVE5DSlRCQlkyRnVkbUZ6TG1obGFXZG9kQ1V5TUNVelJDVXlNREl3TUNVelFpVXdRWEp2YjNRdVlYQndaVzVrUTJocGJHUW9ZMkZ1ZG1GektTVXpRaVV3UVNVd1FXTnZibk4wSlRJd1kzUjRKVEl3SlRORUpUSXdZMkZ1ZG1GekxtZGxkRU52Ym5SbGVIUW9KVEl5TW1RbE1qSXBKVE5DSlRCQlkyOXVjM1FsTWpBbE5VSjNKVEpESlRJd2FDVTFSQ1V5TUNVelJDVXlNQ1UxUWpJd0pUSkRKVEl3WTJGdWRtRnpMbWhsYVdkb2RDVTFSQ1V6UWlVd1FXTnZibk4wSlRJd0pUVkNlQ1V5UXlVeU1Ia2xOVVFsTWpBbE0wUWxNakFsTlVKallXNTJZWE11ZDJsa2RHZ2xNakFsTWtZbE1qQXlKVEpESlRJd1kyRnVkbUZ6TG1obGFXZG9kQ1V5TUNVeVJpVXlNRElsTlVRbE0wSWxNRUVsTUVGamIyNXpkQ1V5TUdSeVlYY2xNakFsTTBRbE1qQW9jbUZrS1NVeU1DVXpSQ1V6UlNVeU1DVTNRaVV3UVNVeU1DVXlNR04wZUM1amJHVmhjbEpsWTNRb01DVXlReVV5TURBbE1rTWxNakJqWVc1MllYTXVkMmxrZEdnbE1rTWxNakJqWVc1MllYTXVhR1ZwWjJoMEtTVXpRaVV3UVNVd1FTVXlNQ1V5TUNVeVJpVXlSaVV5TUdacGNuTjBKVEl3YzJGMlpTVXlNSFJvWlNVeU1IVnVkSEpoYm5Oc1lYUmxaQ1V5Um5WdWNtOTBZWFJsWkNVeU1HTnZiblJsZUhRbE1FRWxNakFsTWpCamRIZ3VjMkYyWlNncEpUTkNKVEJCSlRCQkpUSXdKVEl3WTNSNExtSmxaMmx1VUdGMGFDZ3BKVE5DSlRCQkpUSXdKVEl3SlRKR0pUSkdKVEl3Ylc5MlpTVXlNSFJvWlNVeU1ISnZkR0YwYVc5dUpUSXdjRzlwYm5RbE1qQjBieVV5TUhSb1pTVXlNR05sYm5SbGNpVXlNRzltSlRJd2RHaGxKVEl3Y21WamRDVXdRU1V5TUNVeU1HTjBlQzUwY21GdWMyeGhkR1VvZUNVeVF5VXlNR2dsTWpBbE1rWWxNakF5S1NVelFpVXdRU1V5TUNVeU1DVXlSaVV5UmlVeU1ISnZkR0YwWlNVeU1IUm9aU1V5TUhKbFkzUWxNRUVsTWpBbE1qQmpkSGd1Y205MFlYUmxLSEpoWkNrbE0wSWxNRUVsTUVFbE1qQWxNakFsTWtZbE1rWWxNakJrY21GM0pUSXdkR2hsSlRJd2NtVmpkQ1V5TUc5dUpUSXdkR2hsSlRJd2RISmhibk5tYjNKdFpXUWxNakJqYjI1MFpYaDBKVEJCSlRJd0pUSXdZM1I0TG5KbFkzUW9MWGNsTWpBbE1rWWxNakF5SlRKREpUSXdMV2dsTWpBbE1rWWxNakF5SlRKREpUSXdkeVV5UXlVeU1HZ3BKVE5DSlRCQkpUQkJKVEl3SlRJd1kzUjRMbVpwYkd4VGRIbHNaU1V5TUNVelJDVXlNQ1V5TW1keVpXVnVKVEl5SlROQ0pUQkJKVEl3SlRJd1kzUjRMbVpwYkd3b0tTVXpRaVV3UVNVd1FTVXlNQ1V5TUdOMGVDNXlaWE4wYjNKbEtDa2xNMElsTUVFbE4wUWxNMElsTUVFbE1FRWxNa1lsTWtZbE1qQk1hWE4wWlc0bE1qQjBieVV5TUdGdUpUSXdhVzV3ZFhRbE1FRmthWE53YjNObGNuTXVjSFZ6YUNnbE1FRWxNakFsTWpCdFpYUmhabkpoYldVdWIyNUpibkIxZEhNb0tHbHVjSFYwY3lrbE1qQWxNMFFsTTBVbE1qQWxOMElsTUVFbE1qQWxNakFsTWpBbE1qQnRaWFJoWm5KaGJXVXVjMlYwVDNWMGNIVjBjeWhwYm5CMWRITXBKVE5DSlRCQkpUSXdKVEl3SlRJd0pUSXdZMjl1YzNRbE1qQjVKVEl3SlRORUpUSXdhVzV3ZFhSekpUVkNKVEl5ZVNVeU1pVTFSQ1V6UWlVd1FTVXlNQ1V5TUNVeU1DVXlNR2xtSlRJd0tDRjVLU1V5TUNVM1FpVXdRU1V5TUNVeU1DVXlNQ1V5TUNVeU1DVXlNSEpsZEhWeWJpVXpRaVV3UVNVeU1DVXlNQ1V5TUNVeU1DVTNSQ1V3UVNVeU1DVXlNQ1V5TUNVeU1HUnlZWGNvZVNrbE0wSWxNRUVsTWpBbE1qQWxOMFFwSlRCQktTVXpRaVV3UVdSeVlYY29NQ2tsTTBJbE1FRWxNRUVsTWtZbE1rWWxNakJTWlhSMWNtNGxNakJoSlRJd1kyeGxZVzUxY0NVeU1HWjFibU4wYVc5dUpUQkJkMmx1Wkc5M0xuTmpjbWx3ZEZWdWJHOWhaQ1V5TUNVelJDVXlNQ2dwSlRJd0pUTkVKVE5GSlRJd0pUZENKVEJCSlRJd0pUSXdkMmhwYkdVbE1qQW9aR2x6Y0c5elpYSnpMbXhsYm1kMGFDVXlNQ1V6UlNVeU1EQXBKVEl3SlRkQ0pUQkJKVEl3SlRJd0pUSXdKVEl3WkdsemNHOXpaWEp6TG5CdmNDZ3BLQ2tsTTBJbE1FRWxNakFsTWpBbE4wUWxNRUVsTjBRbE0wSWxNRUUlM0QlMjZtb2R1bGVzJTNESlRWQ0pUVkUlMjZvcHRpb25zJTNEZXlKb2FXUmxiV1Z1ZFdsbWFXWnlZVzFsSWpwMGNuVmxMQ0p0YjJSbElqb2lhbUYyWVhOamNtbHdkQ0lzSW5OaGRtVnNiMkZrYVc1b1lYTm9JanAwY25WbExDSjBhR1Z0WlNJNklteHBaMmgwSW4wJTNEJTIyJTdEJTdEJTJDJTIycGx1Z2lucyUyMiUzQSU1QiUyMmh0dHBzJTNBJTJGJTJGbWVybWFpZC5tdGZtLmlvJTJGJTIzJTNGaG0lM0RkaXNhYmxlZCUyMiUyQyUyMmh0dHBzJTNBJTJGJTJGZWRpdG9yLm10Zm0uaW8lMkYlMjMlM0ZobSUzRGRpc2FibGVkJTI2b3B0aW9ucyUzREpUZENKVEl5Ylc5a1pTVXlNaVV6UVNVeU1tcHpiMjRsTWpJbE1rTWxNakp6WVhabGJHOWhaR2x1YUdGemFDVXlNaVV6UVhSeWRXVWxNa01sTWpKMGFHVnRaU1V5TWlVelFTVXlNbXhwWjJoMEpUSXlKVGRFJTIyJTVEJTJDJTIydmVyc2lvbiUyMiUzQSUyMjAuMyUyMiU3RA==&minimal=false)


## Description

 - user created javascript
 - user defined css modules

Think of this like [codepen](https://codepen.io) or [others](https://www.sitepoint.com/code-playgrounds/) but stripped down focusing on core essentials, performance, and durability.

This website is also a [metaframe](https://docs.metapage.io/docs/what-is-a-metaframe): connect metaframes together into apps/workflows/dashboards: [metapages](https://docs.metapage.io/docs)

[Github Repo](https://github.com/metapages/metaframe-js)

**Architecture:**


 - no state is stored on the server (all embedded in the URL)
   - this imposes some limits but current URL lengths are large or not specifically limited
 - The server simply serves a little `index.html`
 - The client then runs the embedded javascript (the javascript code is **not** sent to the server)

The server runs on https://deno.com/deploy which is

 - simple
 - fast
 - very performant
 - deploys immediately with a simply push to the repository
 - 🌟🌟🌟🌟🌟
