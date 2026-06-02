# Jupyter

Use any metaframe as an interactive Jupyter notebook widget with the `metaframe-widget` package.

This guide walks you through every step — from installing Python to building multi-widget pipelines.

## Step 1: Create a virtual environment

A virtual environment keeps your project's packages isolated. This is strongly recommended.

```bash
# Create a new directory for your project
mkdir my-metaframe-project
cd my-metaframe-project

# Create a virtual environment
python3 -m venv .venv

# Activate it
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell
# .venv\Scripts\activate.bat     # Windows CMD
```

Your terminal prompt should now show `(.venv)` at the beginning, confirming the environment is active.

## Step 2: Install JupyterLab and metaframe-widget

```bash
pip install metaframe-widget jupyterlab
```

This installs both JupyterLab (the notebook interface) and `metaframe-widget` (the metaframe integration). The widget is built on [anywidget](https://anywidget.dev/), so all widget dependencies are handled automatically.

::: tip Already have Jupyter installed?
If you already have a Jupyter environment, you only need:
```bash
pip install metaframe-widget
```
:::

## Step 3: Launch JupyterLab

```bash
jupyter lab
```

This opens JupyterLab in your browser (usually at `http://localhost:8888`). If it doesn't open automatically, copy the URL from the terminal output — it includes an authentication token.

## Step 4: Create a new notebook

1. In JupyterLab, click the **"+"** button or go to **File → New → Notebook**
2. Select the **Python 3** kernel when prompted
3. You now have an empty notebook ready to go

## Step 5: Display your first widget

In the first cell of your notebook, type and run (`Shift+Enter`):

```python
from metaframe_widget import MetaframeWidget

w = MetaframeWidget(url="https://framejs.io/")
w
```

You should see the metaframe editor rendered as an interactive iframe directly in your notebook. The widget is live — you can interact with it just like you would in a browser.

## Creating widgets

There are three ways to create a widget:

### From a short URL

If you have a saved metaframe, use its [short url](../guide/short-urls):

```python
w = MetaframeWidget(url="https://framejs.io/j/xxx")
w
```

This is the most compact way to embed a metaframe — the code lives behind the
short URL instead of being inlined in the cell.

#### Editing and saving back

You can edit the code directly inside the widget. When you click **Save and
Shorten URL** in the editor toolbar, a new short URL is minted and shown in the
"Saved:" bar at the bottom of the widget. It is also available in Python:

```python
w.saved_url  # → "https://framejs.io/j/yyy"
```

Copy that value into your cell (replacing the old URL) to persist your edits
across notebook re-runs. To react to saves programmatically:

```python
w.on_saved_url_change(lambda change: print("Saved:", change["new"]))
```

Saving does not reload the iframe, so your editing session is never interrupted.

### From a full URL

You can paste any full metaframe URL. These tend to be long since they encode the code in the hash:

```python
w = MetaframeWidget(url="https://framejs.io/#?js=...")
w
```

### From inline code (recommended)

Write JavaScript directly in Python — no URL needed. This is the most flexible approach:

```python
w = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = JSON.stringify(inputs);
    setOutput("echo", inputs);
};
""")
w
```

The JavaScript code runs inside the widget's iframe. You have access to the full metaframe API: `getInput()`, `setOutput()`, `onInputs()`, and a `<div id="root">` element for rendering.

## Sending data from Python to the widget

Use `set_inputs()` to send a dictionary, or `set_input()` for a single key:

```python
# Send multiple values at once
w.set_inputs({"data": [1, 2, 3], "message": "hello from Python"})

# Send a single value
w.set_input("count", 42)
```

The widget receives these as inputs. If your widget code defines `onInputs`, it will be called with the new values.

**Full example — send data and display it:**

```python
from metaframe_widget import MetaframeWidget

# Create a widget that displays whatever inputs it receives
display_widget = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    const root = document.getElementById("root");
    root.innerHTML = "<pre>" + JSON.stringify(inputs, null, 2) + "</pre>";
};
""", height="200px")
display_widget
```

Then in the next cell:

```python
display_widget.set_inputs({
    "name": "Alice",
    "scores": [95, 87, 92],
    "metadata": {"course": "CS101"}
})
```

The widget updates live — no need to re-run the cell that displays it.

## Reading data back from the widget

### Read current outputs

```python
print(w.outputs)
```

::: info Outputs are asynchronous
The widget runs in an iframe, so outputs arrive asynchronously. If `w.outputs` shows `{}`, wait a moment and re-run the cell. The outputs populate once the widget's JavaScript has executed.
:::

### React to output changes

Register a callback that fires whenever the widget emits new outputs:

```python
w.on_outputs_change(lambda change: print("Got:", change["new"]))
```

The callback receives a dict with `"new"` (the updated outputs) and `"old"` (the previous outputs).

**Full example — round-trip data through a widget:**

```python
from metaframe_widget import MetaframeWidget

# Widget that doubles every number in the "data" input
doubler = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    if (inputs.data) {
        const doubled = inputs.data.map(x => x * 2);
        document.getElementById("root").textContent = JSON.stringify(doubled);
        setOutput("doubled", doubled);
    }
};
""", height="100px")
doubler
```

Then in subsequent cells:

```python
# Register a callback to capture outputs
doubler.on_outputs_change(lambda change: print("Doubled:", change["new"]))

# Send data — the callback prints when the widget responds
doubler.set_inputs({"data": [10, 20, 30]})
```

```python
# Read the outputs directly
doubler.outputs  # → {"doubled": [20, 40, 60]}
```

## Piping widgets together

Connect the output of one widget to the input of another to build processing pipelines:

```python
from metaframe_widget import MetaframeWidget

# Source widget: echoes inputs as outputs
source = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = "Source: " + JSON.stringify(inputs);
    Object.keys(inputs).forEach(key => setOutput(key, inputs[key]));
};
""", height="80px")

# Sink widget: receives piped data
sink = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = "Sink received: " + JSON.stringify(inputs);
};
""", height="80px")

# Connect: when source emits "data", push it to sink's "data" input
source.pipe_to(sink, output_key="data", input_key="data")
```

Display both widgets:

```python
source
```

```python
sink
```

Then trigger the pipeline:

```python
source.set_inputs({"data": [1, 2, 3]})
# The sink widget automatically updates with the piped data
```

## Real-world example: CSV data visualization

Load a CSV file in Python and render it as an interactive table in a widget:

```python
import csv
from metaframe_widget import MetaframeWidget

# 1. Load data
with open("data.csv") as f:
    rows = list(csv.DictReader(f))
print(f"Loaded {len(rows)} rows")

# 2. Create a table widget
table = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    const rows = inputs.rows;
    if (!rows || rows.length === 0) {
        document.getElementById("root").textContent = "No data";
        return;
    }
    const cols = Object.keys(rows[0]);
    const table = document.createElement("table");
    table.style.cssText = "border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px";

    const thead = table.createTHead();
    const hr = thead.insertRow();
    cols.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        th.style.cssText = "border:1px solid #ccc;padding:6px 10px;background:#f0f0f0;text-align:left";
        hr.appendChild(th);
    });

    const tbody = table.createTBody();
    rows.forEach(row => {
        const tr = tbody.insertRow();
        cols.forEach(col => {
            const td = tr.insertCell();
            td.textContent = row[col];
            td.style.cssText = "border:1px solid #ccc;padding:6px 10px";
        });
    });

    document.getElementById("root").replaceChildren(table);
    setOutput("rows", rows);
    setOutput("count", rows.length);
};
""", height="300px")
table
```

```python
# 3. Send data to the widget
table.set_inputs({"rows": rows})
```

## Widget sizing

Control the widget dimensions with `width` and `height` (CSS values):

```python
# Default: 100% width, 400px height
w = MetaframeWidget(url="...", width="100%", height="400px")

# Smaller widget
w = MetaframeWidget.from_code("...", height="150px", width="50%")
```

## Supported environments

`metaframe-widget` works in:

- **JupyterLab** — full support
- **Jupyter Notebook** (classic) — full support
- **VS Code** — Jupyter notebooks in VS Code work out of the box
- **Google Colab** — works via anywidget compatibility

## Developer guide

### Running locally with Docker

```bash
just jupyter-docker
```

Open [http://localhost:8888](http://localhost:8888) in your browser.

To use a different port:

```bash
JUPYTER_PORT=9999 just jupyter-docker
```

### Running locally without Docker

```bash
pip install -e "python/[dev]"
pip install -e "examples/jupyter[dev]"
jupyter lab --ServerApp.root_dir=examples/jupyter
```

### Running tests

```bash
just test-jupyter          # unit + notebook + browser (Docker)
just test-jupyter-unit     # unit tests only
just test-jupyter-notebook # nbmake notebook execution
just test-jupyter-browser  # Playwright browser tests (no network)
```

### Publishing

The widget is published from the canonical `python/` directory:

```bash
just build-python    # builds python/dist/
just publish-python  # publishes to PyPI
```

Or via git tag for CI: `git tag python-v0.1.0 && git push origin python-v0.1.0`
