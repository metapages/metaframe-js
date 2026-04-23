# Worker

The worker is a Deno backend using the Hono framework. It serves the static frontend and handles routing.

## Location

```
worker/
├── server.ts
├── deno.json
├── deno.lock
├── index.html
├── sw.js              # Service worker
├── static/
└── ...
```

## Key details

- Uses Deno URL imports + `npm:` specifiers for npm packages
- Type checking: `just worker/check` (runs `deno check server.ts`)
- Formatting: `just worker/fmt` (runs `deno fmt`)
- Deployed to [Deno Deploy](https://deno.com/deploy)

## Development

The worker runs as part of the full dev stack:

```bash
just dev
```

To type-check:

```bash
just worker/check
```
