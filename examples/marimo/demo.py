import marimo

__generated_with = "0.9.0"
app = marimo.App(width="medium")


@app.cell
def __():
    import marimo as mo
    from metaframe_widget import MetaframeWidget
    return MetaframeWidget, mo


@app.cell
def __(mo):
    mo.md("# Metaframe Widget in marimo")
    return


@app.cell
def __(mo):
    mo.md("## 1. Create a widget from a URL")
    return


@app.cell
def __(MetaframeWidget, mo):
    w = mo.ui.anywidget(MetaframeWidget(url="https://js.mtfm.io/"))
    w
    return (w,)


@app.cell
def __(mo):
    mo.md("## 2. Create from inline code")
    return


@app.cell
def __(MetaframeWidget, mo):
    echo = mo.ui.anywidget(
        MetaframeWidget.from_code(
            """
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = JSON.stringify(inputs);
    // Pass each input key through as a separate output
    Object.keys(inputs).forEach(key => setOutput(key, inputs[key]));
};
"""
        )
    )
    echo
    return (echo,)


@app.cell
def __(mo):
    mo.md("## 3. Push inputs from Python")
    return


@app.cell
def __(echo):
    echo.set_inputs({"data": [1, 2, 3], "message": "hello from marimo"})
    return


@app.cell
def __(mo):
    mo.md("## 4. Read outputs (reactive — this cell re-runs when outputs change)")
    return


@app.cell
def __(echo):
    echo.outputs
    return


@app.cell
def __(mo):
    mo.md("## 5. Pipe five widgets together")
    return


@app.cell
def __(MetaframeWidget, mo):
    # Create all widgets upfront in one cell so they are never recreated.
    # Use pipe_to() for connections — traitlets observers forward outputs
    # to the next widget's inputs without triggering marimo cell re-runs.

    w_echo = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    document.getElementById("root").textContent = "1 echo: " + JSON.stringify(inputs);
    Object.keys(inputs).forEach(key => setOutput(key, inputs[key]));
};
""", height="80px")

    w_double = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    if (inputs.data) {
        const r = inputs.data.map(x => x * 2);
        document.getElementById("root").textContent = "2 doubled: " + JSON.stringify(r);
        setOutput("data", r);
    }
};
""", height="80px")

    w_triple = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    if (inputs.data) {
        const r = inputs.data.map(x => x * 3);
        document.getElementById("root").textContent = "3 tripled: " + JSON.stringify(r);
        setOutput("data", r);
    }
};
""", height="80px")

    w_add10 = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    if (inputs.data) {
        const r = inputs.data.map(x => x + 10);
        document.getElementById("root").textContent = "4 +10: " + JSON.stringify(r);
        setOutput("data", r);
    }
};
""", height="80px")

    w_negate = MetaframeWidget.from_code("""
export const onInputs = (inputs) => {
    if (inputs.data) {
        const r = inputs.data.map(x => -x);
        document.getElementById("root").textContent = "5 negated: " + JSON.stringify(r);
        setOutput("data", r);
    }
};
""", height="80px")

    # Chain: echo → double → triple → add10 → negate
    w_echo.pipe_to(w_double, "data")
    w_double.pipe_to(w_triple, "data")
    w_triple.pipe_to(w_add10, "data")
    w_add10.pipe_to(w_negate, "data")

    pipe_echo = mo.ui.anywidget(w_echo)
    mo.vstack([
        pipe_echo,
        mo.ui.anywidget(w_double),
        mo.ui.anywidget(w_triple),
        mo.ui.anywidget(w_add10),
        mo.ui.anywidget(w_negate),
    ])
    return (pipe_echo,)


@app.cell
def __(pipe_echo):
    # Push data through the 5-widget pipeline: [1,2,3] → ×2 → ×3 → +10 → negate
    pipe_echo.set_inputs({"data": [1, 2, 3]})
    return


@app.cell
def __(pipe_echo):
    pipe_echo.outputs
    return


if __name__ == "__main__":
    app.run()
