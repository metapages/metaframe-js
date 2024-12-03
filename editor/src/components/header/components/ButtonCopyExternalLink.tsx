import React, { useEffect, useState } from 'react';
import { useMetaframeUrl } from '/@/hooks/useMetaframeUrl';

import {
  Box,
  Icon,
  Tooltip,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { Link } from "@phosphor-icons/react";
import {
  setHashValueInHashString,
} from '@metapages/hash-query';

export const ButtonCopyExternalLink: React.FC = () => {
  const { url } = useMetaframeUrl();
  const [urlForCopy, setUrlForCopy] = useState('');

  useEffect(() => {
    if (!url) return;
    const isLocal = window.location.hostname.includes('localhost');
    let newUrl = setHashValueInHashString(url, 'edit', undefined)
    if (isLocal) {
      // TODO: swap localhost in for url val, useMetaframeUrl uses env variables to construct the path
      setUrlForCopy(newUrl);
    } else {
      setUrlForCopy(newUrl);
    }
  }, [url])

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
