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
    setOutput("echo", inputs);
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
    mo.md("## 5. Pipe widgets together")
    return


@app.cell
def __(MetaframeWidget, echo, mo):
    doubler = mo.ui.anywidget(
        MetaframeWidget.from_code(
            """
export const onInputs = (inputs) => {
    if (inputs.data) {
        const doubled = inputs.data.map(x => x * 2);
        document.getElementById("root").textContent = JSON.stringify(doubled);
        setOutput("doubled", doubled);
    }
};
"""
        )
    )
    # Connect echo's output to doubler's input
    echo.widget.pipe_to(doubler.widget, output_key="echo", input_key="data")
    doubler
    return (doubler,)


@app.cell
def __(doubler):
    doubler.outputs
    return


if __name__ == "__main__":
    app.run()
