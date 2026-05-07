# AI Usage

Generate and run JavaScript metaframes using AI — from chat interfaces or directly from the Command Line Interface, or via APIs

## Command Line: installation into Claude Code

Two ways to use it — paste the URL for one-off use, or install the slash command for repeat use.

### Installation method 1: paste the URL into the terminal

Paste the URL and describe what you want:

> https://js.mtfm.io/llms-claude-code.txt
>
> Make a bouncing ball animation

### Installation method 2: install the `/js` slash command 

For repeat use, install the slash command globally:

```bash
mkdir -p ~/.claude/commands
curl -sL https://js.mtfm.io/llms-claude-code.txt -o ~/.claude/commands/js.md
```

#### `/js`  command prompt variants:


**Create a visualization from a prompt:**

```
/js make a bouncing ball animation
```

**Create a visualization from a file:**

```
/js visualize ./data.csv
```

**Modify an existing URL:**

Use the short URL (top right `Edit -> Short URL`) to paste into the prompt, the full non-shortened URL is too much context to decode:

```
/js https://js.mtfm.io/j/<sha256> update the visualization make the background white
```



## Using an AI chat interface

From the component page:

1. `Edit (top right)->Copy button` to copy the AI prompt
2. Paste into Claude, ChatGPT, or any LLM chat interface
3. Describe what you want
4. Copy the generated JavaScript back into the editor

![Copy AI prompt](/readme-images/js-copy-ai.gif "Copy prompt for LLM AI")

## From an AI API

Give the LLM the URL [`https://js.mtfm.io/llms.txt`](https://js.mtfm.io/llms.txt) along with your request. The LLM will respond with a JavaScript code block that you can paste into the editor at [js.mtfm.io](https://js.mtfm.io).


## URL encoding format

The JavaScript is encoded into the URL hash using this scheme:

```
encodeURIComponent(code) → base64 → URL hash parameter
```

In JavaScript:

```js
const encoded = btoa(encodeURIComponent(code));
const url = `https://js.mtfm.io/#?js=${encoded}`;
```


## How it works

Claude Code will:

1. Encode the JavaScript in memory using `Buffer.from(encodeURIComponent(code)).toString('base64')`
2. Open `https://js.mtfm.io/#?js={encoded}&edit=true` in your browser

No files are written — everything happens in a single `node -e` command. The `&edit=true` parameter opens the editor so you can modify the code. Every update opens a new tab with the latest code.


## LLM integration files

| File | Purpose |
|------|---------|
| [`/llms.txt`](https://js.mtfm.io/llms.txt) | For AI chat / API — outputs a JavaScript code block |
| [`/llms-claude-code.txt`](https://js.mtfm.io/llms-claude-code.txt) | For Claude Code terminal — encodes and opens browser directly |

Both files contain the same JavaScript coding guidance (ES6 modules, globals, patterns, available libraries). They differ only in how the output is delivered.
