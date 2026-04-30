import base64
import urllib.parse

import anywidget
import traitlets

from ._esm import ESM

import base64

import urllib.parse

# Equivalent to btoa(encodeURIComponent(value));
def string_to_base64_string(value: str) -> str:
    encoded_uri_component = urllib.parse.quote(value, safe="-_.!~*'()")
    return base64.b64encode(encoded_uri_component.encode("ascii")).decode("ascii")


class MetaframeWidget(anywidget.AnyWidget):
    """Widget that renders a metaframe iframe (works in Jupyter and marimo).

    Args:
        url: Full metaframe URL (including hash params).
        inputs: Dict of inputs to push to the metaframe.
        outputs: Dict of outputs received from the metaframe (read-only).
        width: CSS width for the widget container (default "100%").
        height: CSS height for the widget container (default "400px").
        allow: iframe allow attribute string (e.g. "camera; microphone").
    """

    _esm = ESM

    url = traitlets.Unicode("").tag(sync=True)
    inputs = traitlets.Dict({}).tag(sync=True)
    outputs = traitlets.Dict({}).tag(sync=True)
    width = traitlets.Unicode("100%").tag(sync=True)
    height = traitlets.Unicode("400px").tag(sync=True)
    allow = traitlets.Unicode("").tag(sync=True)

    def set_inputs(self, d: dict):
        """Merge a dict into the current inputs."""
        self.inputs = {**self.inputs, **d}

    def set_input(self, key: str, value):
        """Set a single input key."""
        self.inputs = {**self.inputs, key: value}

    def on_outputs_change(self, callback):
        """Register a callback for when outputs change.

        The callback receives a change dict with 'old' and 'new' keys.
        """
        self.observe(callback, names=["outputs"])

    @classmethod
    def from_code(
        cls,
        js_code: str,
        width: str = "100%",
        height: str = "400px",
        allow: str = "",
        **kwargs,
    ) -> "MetaframeWidget":
        """Create a MetaframeWidget from raw JavaScript code.

        Encodes the code into a js.mtfm.io URL with the code in the hash.

        Args:
            js_code: JavaScript source for the metaframe.
            width: CSS width for the widget container (default "100%").
            height: CSS height for the widget container (default "400px").
            allow: iframe allow attribute string (e.g. "camera; microphone").
        """
        encoded = string_to_base64_string(js_code)
        url = f"https://js.mtfm.io/#?js={encoded}"
        return cls(url=url, width=width, height=height, allow=allow, **kwargs)

    def pipe_to(self, target: "MetaframeWidget", output_key: str, input_key: str = None):
        """Connect an output of this widget to an input of another.

        When this widget's output_key changes, push the value to
        target's input_key (defaults to output_key if not specified).
        """
        if input_key is None:
            input_key = output_key

        def _forward(change):
            new_outputs = change.get("new", {})
            if output_key in new_outputs:
                target.set_input(input_key, new_outputs[output_key])

        self.observe(_forward, names=["outputs"])
