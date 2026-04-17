import React, { useEffect, useState } from "react";

import { InputsHashParam } from "/@/components/sections/settings/SectionInputs";
import { useMetaframeUrl } from "/@/hooks/useMetaframeUrl";
import {
  getAllowedHashParams,
  stripDisallowedHashParams,
} from "/@/utils/hashParams";

import { Box, Icon, Tooltip, useToast } from "@chakra-ui/react";
import {
  getHashParamValueJsonFromWindow,
  setHashParamValueInHashString,
  setHashParamValueJsonInHashString,
} from "@metapages/hash-query/react-hooks";
import { MetaframeDefinition } from "@metapages/metapage";
import { useMetaframe } from "@metapages/metapage-react/hooks";
import { CopyIcon } from "@phosphor-icons/react";

async function encodeBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binString = "";
  const size = bytes.length;
  for (let i = 0; i < size; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString);
}

async function buildExternalShareUrl(
  url: string | undefined,
  metaframeInputs: InputsHashParam | undefined,
): Promise<string> {
  if (!url) return "";
  let newUrl = setHashParamValueInHashString(url, "edit", undefined);
  let newInputs: InputsHashParam | undefined = getHashParamValueJsonFromWindow<
    InputsHashParam | undefined
  >("inputs");
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
          newInputs[key] = { type: "base64", value: blobString };
        } else {
          newInputs[key] = { type: "json", value };
        }
      } else {
        newInputs[key] = { type: "json", value };
      }
    }
  }

  if (newInputs && Object.keys(newInputs).length > 0) {
    newUrl = setHashParamValueJsonInHashString(newUrl, "inputs", newInputs);
  }

  // Strip any hash params not in the metaframe.json defaults or the user's
  // `definition` whitelist.
  const definition = getHashParamValueJsonFromWindow<
    MetaframeDefinition | undefined
  >("definition");
  newUrl = stripDisallowedHashParams(newUrl, getAllowedHashParams(definition));

  return newUrl;
}

export const ButtonCopyExternalLink: React.FC = () => {
  const { url } = useMetaframeUrl();
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

  const toast = useToast();

  return (
    <Box position="relative" display="inline-block">
      <Tooltip label={"Copy URL"}>
        <Icon
          aria-label="copy url"
          _hover={{ bg: "gray.300" }}
          bg={"none"}
          p={"3px"}
          borderRadius={5}
          as={CopyIcon}
          boxSize="7"
          onClick={async () => {
            try {
              const urlForCopy = await buildExternalShareUrl(
                url,
                metaframeInputs,
              );
              await navigator.clipboard.writeText(urlForCopy);
              toast({
                title: "Copied URL to clipboard",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            } catch {
              toast({
                title: "Could not copy URL",
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            }
          }}
        />
      </Tooltip>
    </Box>
  );
};
