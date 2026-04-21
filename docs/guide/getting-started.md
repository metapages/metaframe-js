# Getting Started

## What is metaframe-js?

[metaframe-js](https://js.mtfm.io) lets you run arbitrary JavaScript modules directly in the browser, with all code embedded in the URL. There is no server-side storage — the URL *is* the program.

It is designed for [metapages](https://metapage.io) so you can connect inputs and outputs to other metaframe URLs. Similar to [CodePen](https://codepen.io/) or [JSFiddle](https://jsfiddle.net/), but completely self-contained.

## How to use it

1. Go to [js.mtfm.io](https://js.mtfm.io)
2. Write JavaScript in the editor
3. The code runs immediately — the URL updates to contain your code
4. Share the URL with anyone

## Edit with AI

1. Copy the AI prompt (click the copy button), paste into Claude or ChatGPT, then ask what you want

   ![Copy AI prompt](/readme-images/js-copy-ai.gif "Copy prompt for LLM AI")

2. Copy the result back to the JavaScript window. Now you have something to share or embed.

## JavaScript overview

- Code is an ES6 module
- Top-level `await` is supported
- Export `onInputs` to listen to inputs from connected metaframes
- Send outputs with `setOutput` / `setOutputs`
- Export `onResize` to handle window/div resizes
- Use ES6 module imports, or add CSS / npm modules — everything is embedded in the URL

See the full [JavaScript API](./javascript-api) for details.

## Python widget

Install the `metaframe-widget` package to use any metaframe as an interactive widget in Jupyter or marimo:

```bash
pip install metaframe-widget
```

See [Jupyter integration](../integrations/jupyter) and [marimo integration](../integrations/marimo) for usage.
