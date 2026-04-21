# Jupyter

Use any metaframe as an interactive Jupyter notebook widget with the `metaframe-widget` package.

## Installation

```bash
pip install metaframe-widget
```

## Basic usage

```python
from metaframe_widget import MetaframeWidget

# From a URL — paste any metaframe URL
w = MetaframeWidget(url="https://js.mtfm.io/#?js=...")
w  # renders the iframe in the notebook
```

## Create from inline code

```python
w = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = JSON.stringify(inputs);
    setOutput("echo", inputs);
};
""")
w
```

## Push inputs from Python

```python
w.set_inputs({"data": [1, 2, 3], "message": "hello from Python"})
w.set_input("count", 42)
```

## Read and react to outputs

```python
# Read current outputs
print(w.outputs)

# React to output changes
w.on_outputs_change(lambda change: print("Got:", change["new"]))
```

## Pipe widgets together

Connect the output of one widget to the input of another:

```python
source = MetaframeWidget.from_code("...")
sink = MetaframeWidget.from_code("...")

# When source emits "doubled", push it to sink's "data" input
source.pipe_to(sink, output_key="doubled", input_key="data")
```

Works in Jupyter, JupyterLab, VS Code, and Colab.

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
