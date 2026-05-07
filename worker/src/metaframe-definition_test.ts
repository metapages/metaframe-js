import { assertEquals } from "@std/assert";
import { blobToBase64String } from "https://esm.sh/@metapages/hash-query@0.10.0";
import {
  computeMetaframeDefinition,
  DEFAULT_METAFRAME_DEFINITION,
  getAllowedHashParams,
} from "./metaframe-definition.ts";

Deno.test(
  "computeMetaframeDefinition returns default when no hashParams",
  () => {
    const result = computeMetaframeDefinition(undefined);
    assertEquals(result, DEFAULT_METAFRAME_DEFINITION);
  },
);

Deno.test(
  "computeMetaframeDefinition returns default when hashParams has no definition",
  () => {
    const hashParams = "?js=Y29uc29sZS5sb2coImhpIik=";
    const result = computeMetaframeDefinition(hashParams);
    assertEquals(result, DEFAULT_METAFRAME_DEFINITION);
  },
);

Deno.test(
  "computeMetaframeDefinition merges definition inputs and outputs",
  () => {
    const definition = {
      inputs: { dataIn: { type: "json" } },
      outputs: { dataOut: { type: "json" } },
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    assertEquals(result.inputs, { dataIn: { type: "json" } });
    assertEquals(result.outputs, { dataOut: { type: "json" } });
  },
);

Deno.test(
  "computeMetaframeDefinition includes default hashParams when definition has no hashParams",
  () => {
    const definition = {
      inputs: { foo: { type: "json" } },
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    // Should still have all default hashParams
    const resultKeys = Object.keys(
      result.hashParams as Record<string, unknown>,
    );
    assertEquals(resultKeys.includes("js"), true);
    assertEquals(resultKeys.includes("inputs"), true);
    assertEquals(resultKeys.includes("options"), true);
    assertEquals(resultKeys.includes("bgColor"), true);
  },
);

Deno.test(
  "computeMetaframeDefinition adds custom hashParams from definition (object-shaped)",
  () => {
    const definition = {
      hashParams: {
        myCustomParam: {
          type: "string",
          description: "A custom param",
          label: "Custom",
        },
        anotherParam: {
          type: "json",
          description: "Another",
          label: "Another",
        },
      },
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    const resultHP = result.hashParams as Record<string, unknown>;
    // Custom params are present
    assertEquals(resultHP["myCustomParam"], {
      type: "string",
      description: "A custom param",
      label: "Custom",
    });
    assertEquals(resultHP["anotherParam"], {
      type: "json",
      description: "Another",
      label: "Another",
    });
    // Default params are still present
    assertEquals(
      resultHP["js"],
      (DEFAULT_METAFRAME_DEFINITION.hashParams as Record<string, unknown>)[
        "js"
      ],
    );
    assertEquals(
      resultHP["inputs"],
      (DEFAULT_METAFRAME_DEFINITION.hashParams as Record<string, unknown>)[
        "inputs"
      ],
    );
  },
);

Deno.test(
  "computeMetaframeDefinition adds custom hashParams from definition (array-shaped)",
  () => {
    const definition = {
      hashParams: ["myCustomParam", "anotherParam"],
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    const resultHP = result.hashParams as Record<string, unknown>;
    // Custom params added with minimal metadata
    assertEquals(resultHP["myCustomParam"], { type: "string" });
    assertEquals(resultHP["anotherParam"], { type: "string" });
    // Default params still present
    assertEquals(
      resultHP["js"],
      (DEFAULT_METAFRAME_DEFINITION.hashParams as Record<string, unknown>)[
        "js"
      ],
    );
  },
);

Deno.test(
  "computeMetaframeDefinition overrides metadata from definition",
  () => {
    const definition = {
      metadata: { name: "My Custom Metaframe", tags: ["custom"] },
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    assertEquals(result.metadata, {
      name: "My Custom Metaframe",
      tags: ["custom"],
    });
  },
);

Deno.test("computeMetaframeDefinition overrides allow from definition", () => {
  const definition = {
    allow: "clipboard-write; camera",
  };
  const hashParams = `?definition=${blobToBase64String(definition)}`;
  const result = computeMetaframeDefinition(hashParams);

  assertEquals(result.allow, "clipboard-write; camera");
});

Deno.test(
  "computeMetaframeDefinition preserves default allow when definition omits it",
  () => {
    const definition = {
      inputs: { x: { type: "json" } },
    };
    const hashParams = `?definition=${blobToBase64String(definition)}`;
    const result = computeMetaframeDefinition(hashParams);

    assertEquals(result.allow, "clipboard-write");
  },
);

Deno.test("getAllowedHashParams returns defaults when no definition", () => {
  const allowed = getAllowedHashParams(undefined);
  const defaultHP = DEFAULT_METAFRAME_DEFINITION.hashParams as Record<
    string,
    unknown
  >;
  for (const name of Object.keys(defaultHP)) {
    assertEquals(allowed.has(name), true);
  }
});

Deno.test(
  "getAllowedHashParams includes user-whitelisted params (object-shaped)",
  () => {
    const allowed = getAllowedHashParams({
      metadata: { name: "x" },
      hashParams: {
        myCustom: { type: "string" },
        anotherOne: { type: "boolean" },
      },
    } as any);
    assertEquals(allowed.has("myCustom"), true);
    assertEquals(allowed.has("anotherOne"), true);
    assertEquals(allowed.has("js"), true);
    assertEquals(allowed.has("inputs"), true);
  },
);

Deno.test(
  "getAllowedHashParams includes user-whitelisted params (array-shaped)",
  () => {
    const allowed = getAllowedHashParams({
      metadata: { name: "x" },
      hashParams: ["myCustom", "anotherOne"],
    } as any);
    assertEquals(allowed.has("myCustom"), true);
    assertEquals(allowed.has("anotherOne"), true);
    assertEquals(allowed.has("js"), true);
  },
);
