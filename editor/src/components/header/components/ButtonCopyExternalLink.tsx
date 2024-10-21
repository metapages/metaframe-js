import { useMetaframeUrl } from '/@/hooks/useMetaframeUrl';

import {
  Box,
  Icon,
  Tooltip,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { Link } from "@phosphor-icons/react";

export const ButtonCopyExternalLink: React.FC = () => {
  const { url } = useMetaframeUrl();
  const toast = useToast();
  const { onCopy } = useClipboard(url);

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
