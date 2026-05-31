import { useEffect } from "react";

import { useHashParamBase64 } from "@metapages/hash-query/react-hooks";

// The id used to tag the injected element so we can find/replace/remove it.
const ELEMENT_ID = "mtfm-css-hash-param";

// A decoded value is treated as a stylesheet URL (injected as <link>) when it is
// a single-line http(s) URL; otherwise it is treated as raw CSS text (<style>).
const isStylesheetUrl = (value: string): boolean => {
  const trimmed = value.trim();
  return /^https?:\/\/\S+$/.test(trimmed) && !/\s/.test(trimmed);
};

// Loads a global stylesheet from the transient `css` hash param. The value is
// base64-encoded and is either raw CSS text or a URL to a CSS stylesheet.
//
// This param is intentionally NOT in the allowed/canonical hash param lists, so
// it is never persisted into the metaframe definition, copied external links, or
// shortened URLs. It is appended at runtime to apply a global style across many
// pieces of content without modifying their content (their short URLs stay valid).
export const useCssHashParam = (): void => {
  const [css] = useHashParamBase64("css");

  useEffect(() => {
    // Always remove any previously injected element first so changing or
    // clearing the param fully replaces the prior stylesheet.
    document.getElementById(ELEMENT_ID)?.remove();

    if (!css) return;

    const element = isStylesheetUrl(css)
      ? Object.assign(document.createElement("link"), {
          rel: "stylesheet",
          href: css.trim(),
        })
      : Object.assign(document.createElement("style"), { textContent: css });
    element.id = ELEMENT_ID;
    document.head.appendChild(element);

    return () => element.remove();
  }, [css]);
};
