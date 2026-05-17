# AI Usage

Create self contained editable websites, running a single chuck of javascript code.

Create using AI — via chat interfaces, directly from the terminal, or via APIs.

`framejs.io/#?js=< will always run this javascript, forever>`

## Command Line: installation into Claude Code

If you just want to test this command before installing: paste the URL into the AI prompt and describe what you want:

> https://framejs.io/command-js.txt
>
> Make a bouncing ball animation


But for easier usage install the command:

### Claude Code: install the `/js` slash command {#install-js-command}

```bash
mkdir -p ~/.claude/commands
curl -sL https://framejs.io/command-js.md -o ~/.claude/commands/js.md
```

#### `/js`  command prompts: {#js-command-prompts}


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
/js https://framejs.io/j/<sha256> update the visualization make the background white
```



## Using an AI chat interface

From the component page:

1. `Edit (top right)->Copy button` to copy the AI prompt
2. Paste into Claude, ChatGPT, or any LLM chat interface
3. Describe what you want
4. Copy the generated JavaScript back into the editor

![Copy AI prompt](/readme-images/js-copy-ai.gif "Copy prompt and code for AI")

## From an AI API

Give the LLM the URL [`https://framejs.io/llms-prompt.md`](https://framejs.io/llms-prompt.md) along with your request. The LLM will respond with a JavaScript code block that you can paste into the editor at [framejs.io](https://framejs.io).


## URL encoding format

The JavaScript is encoded into the URL hash using this scheme:

```
encodeURIComponent(code) → base64 → URL hash parameter
```

In JavaScript:

```js
const encoded = btoa(encodeURIComponent(code));
const url = `https://framejs.io/#?js=${encoded}`;
```


## How it works

Claude Code will:

1. Encode the JavaScript in memory using `Buffer.from(encodeURIComponent(code)).toString('base64')`
2. Open `https://framejs.io/#?js={encoded}&edit=true` in your browser

No files are written — everything happens in a single `node -e` command. The `&edit=true` parameter opens the editor so you can modify the code. Every update opens a new tab with the latest code.


## LLM integration files

| File | Purpose |
|------|---------|
| [`/llms-prompt.md`](https://framejs.io/llms-prompt.md) | For AI chat / API — outputs a JavaScript code block |
| [`/command-js.md`](https://framejs.io/command-js.md) | For Claude Code terminal — encodes and opens browser directly |

Both files contain the same JavaScript coding guidance (ES6 modules, globals, patterns, available libraries). They differ only in how the output is delivered.
