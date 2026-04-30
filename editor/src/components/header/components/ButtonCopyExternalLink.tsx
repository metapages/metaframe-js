import React, { useEffect, useState } from "react";

import { InputsHashParam } from "/@/components/sections/settings/SectionInputs";
import { useMetaframeUrl } from "/@/hooks/useMetaframeUrl";
import { convertMetaframeInputs } from "/@/utils/convertInputs";
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
    newInputs = await convertMetaframeInputs(
      metaframeInputs,
      newInputs || undefined,
    );
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
