# Getting Started



## What is framejs.io?

[framejs.io](https://framejs.io) lets you run arbitrary JavaScript modules directly in the browser, with all code embedded in the URL. There is no server-side storage: the URL *is* the program.

It is designed for embedding code safely anywhere, creating custom, editable dashboards, user code.

They can combine and connect into [metapages](https://metapage.io), so inputs and outputs can flow between, or embed in [jupyter notebook](../integrations/jupyter) code. Similar to [CodePen](https://codepen.io/) or [JSFiddle](https://jsfiddle.net/), but completely self-contained, editable, and shareable.

## How to use it

1. Go to [framejs.io](https://framejs.io)
2. Write JavaScript in the editor or [edit with AI](./ai)
3. The code runs immediately — the URL updates to contain your code
4. Share the URL with anyone

## JavaScript overview

- Code is an ES6 module
- Top-level `await` is supported
- Export `onInputs` to listen to inputs from connected metaframes
- Send outputs with `setOutput` / `setOutputs`
- Export `onResize` to handle window/div resizes
- Use ES6 module imports, or add CSS / npm modules — everything is embedded in the URL

See the full [JavaScript API](./javascript-api) for details.
