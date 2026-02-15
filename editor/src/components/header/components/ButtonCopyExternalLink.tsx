import React, { useEffect, useState } from "react";

import { InputsHashParam } from "/@/components/sections/settings/SectionInputs";
import { useMetaframeUrl } from "/@/hooks/useMetaframeUrl";

import { Box, Icon, Tooltip, useClipboard, useToast } from "@chakra-ui/react";
import {
  getHashParamValueJsonFromWindow,
  setHashParamValueInHashString,
  setHashParamValueJsonInHashString,
} from "@metapages/hash-query/react-hooks";
import { useMetaframe } from "@metapages/metapage-react/hooks";
import { Link } from "@phosphor-icons/react";

async function encodeBase64(blob: Blob) {
  // blob: Blob
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binString = "";
  const size = bytes.length;
  for (let i = 0; i < size; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString);
}

export const ButtonCopyExternalLink: React.FC = () => {
  const { url } = useMetaframeUrl();
  const [urlForCopy, setUrlForCopy] = useState("");
  // const [inputs] = useHashParamJson<InputsHashParam | undefined>("inputs");
  const metaframeBlob = useMetaframe();
  const [metaframeInputs, setMetaframeInputs] = useState<
    InputsHashParam | undefined
  >(undefined);
  useEffect(() => {
    if (metaframeBlob.metaframe) {
      setMetaframeInputs(metaframeBlob.metaframe.getInputs());
      return metaframeBlob.metaframe.onInputs((inputs: InputsHashParam) => {
        setMetaframeInputs(metaframeBlob.metaframe.getInputs());
      });
    }
  }, [metaframeBlob.metaframe]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      const isLocal = window.location.hostname.includes("localhost");
      let newUrl = setHashParamValueInHashString(url, "edit", undefined);
      // Include current inputs in the copied URL since it's the only way we can
      // carry it with us in the URL. Now these URLs are 100% portable and reproducible.
      // Also used to help the LLM understand the context
      let newInputs: InputsHashParam | undefined =
        getHashParamValueJsonFromWindow<InputsHashParam | undefined>("inputs");
      if (metaframeInputs && Object.keys(metaframeInputs).length > 0) {
        if (!newInputs) {
          newInputs = {};
        }
        for (const [key, value] of Object.entries(metaframeInputs)) {
          if (typeof value === "string") {
            newInputs[key] = { type: "utf8", value: value };
          } else if (typeof value === "object") {
            if (value instanceof Blob) {
              const blobString = await encodeBase64(value);
              if (blobString.length > 10000) {
                console.warn(`Blob ${key} is too large, skipping`);
                continue;
              }
              if (cancelled) return;
              newInputs[key] = { type: "base64", value: blobString };
            } else {
              // assume json, no type, will be assumed native JSON type
              newInputs[key] = { type: "json", value };
            }
          } else {
            // leave the type empty, will be native JSON type
            newInputs[key] = { type: "json", value };
          }
        }
      }

      if (newInputs && Object.keys(newInputs).length > 0) {
        newUrl = setHashParamValueJsonInHashString(newUrl, "inputs", newInputs);
      }
      if (isLocal) {
        // TODO: swap localhost in for url val, useMetaframeUrl uses env variables to construct the path
        setUrlForCopy(newUrl);
      } else {
        setUrlForCopy(newUrl);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, metaframeInputs]);

  const toast = useToast();
  const { onCopy } = useClipboard(urlForCopy);

  return (
    <Box position="relative" display="inline-block">
      <Tooltip label={"Copy Link"}>
        <Icon
          aria-label="copy url"
          _hover={{ bg: "gray.300" }}
          bg={"none"}
          p={"3px"}
          borderRadius={5}
          as={Link}
          boxSize="7"
          onClick={() => {
            onCopy();
            toast({
              title: "Copied URL to clipboard",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          }}
        />
      </Tooltip>
    </Box>
  );
};
