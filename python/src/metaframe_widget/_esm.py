ESM = """
const CDN_URL = "https://cdn.jsdelivr.net/npm/@metapages/metapage@1.10.8/+esm";

let _renderMetapage = null;

async function loadRenderMetapage() {
    if (!_renderMetapage) {
        const mod = await import(CDN_URL);
        _renderMetapage = mod.renderMetapage;
    }
    return _renderMetapage;
}

export default {
    async render({ model, el }) {
        // Size el explicitly so marimo and Jupyter honour width/height
        el.style.display = "block";
        el.style.boxSizing = "border-box";
        el.style.width = model.get("width") || "100%";
        el.style.height = model.get("height") || "400px";

        // Inject CSS to remove iframe borders and inline gaps
        const style = document.createElement("style");
        style.textContent = ".metaframe-widget-container { box-sizing: border-box; width: 100%; height: 100%; } .metaframe-widget-container iframe { border: none; display: block; margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; }";
        el.appendChild(style);

        const container = document.createElement("div");
        container.className = "metaframe-widget-container";
        container.style.width = "100%";
        container.style.height = "100%";
        el.appendChild(container);

        const renderMetapage = await loadRenderMetapage();

        let currentResult = null;

        function applyAllowToIframes() {
            const allow = model.get("allow") || "";
            if (allow) {
                container.querySelectorAll("iframe").forEach(iframe => {
                    iframe.allow = allow;
                });
            }
        }

        async function createMetapage() {
            if (currentResult) {
                currentResult.dispose();
                currentResult = null;
            }
            container.innerHTML = "";

            const url = model.get("url");
            if (!url) return;

            const definition = {
                version: "0.3",
                metaframes: {
                    mf: { url },
                },
            };

            const result = await renderMetapage({
                definition,
                rootDiv: container,
                onOutputs: (outputs) => {
                    const mfOutputs = outputs.mf || {};
                    model.set("outputs", JSON.parse(JSON.stringify(mfOutputs)));
                    model.save_changes();
                },
            });
            currentResult = result;

            applyAllowToIframes();

            // Push current inputs if any
            const inputs = model.get("inputs");
            if (inputs && Object.keys(inputs).length > 0) {
                result.setInputs({ mf: inputs });
            }
        }

        model.on("change:url", createMetapage);

        model.on("change:inputs", () => {
            if (currentResult) {
                const inputs = model.get("inputs");
                currentResult.setInputs({ mf: inputs });
            }
        });

        model.on("change:width", () => {
            el.style.width = model.get("width") || "100%";
        });

        model.on("change:height", () => {
            el.style.height = model.get("height") || "400px";
        });

        model.on("change:allow", applyAllowToIframes);

        await createMetapage();

        return () => {
            if (currentResult) {
                currentResult.dispose();
            }
        };
    },
};
"""
