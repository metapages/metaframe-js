ESM = """
const CDN_URL = "https://cdn.jsdelivr.net/npm/@metapages/metapage@1.10.6/+esm";

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
        const container = document.createElement("div");
        container.style.width = "100%";
        container.style.height = model.get("height") || "400px";
        container.style.overflow = "hidden";
        el.appendChild(container);

        const renderMetapage = await loadRenderMetapage();

        let currentResult = null;

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

        model.on("change:height", () => {
            container.style.height = model.get("height") || "400px";
        });

        await createMetapage();

        return () => {
            if (currentResult) {
                currentResult.dispose();
            }
        };
    },
};
"""
