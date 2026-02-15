import React, { useState } from "react";

import {
  Box,
  Icon,
  Link,
  Tooltip,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { setHashParamValueInHashString } from "@metapages/hash-query/react-hooks";
import { ArrowsInLineHorizontalIcon } from "@phosphor-icons/react";

export const ButtonShortenUrl: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const { onCopy } = useClipboard(shortenedUrl);
  const toast = useToast();

  const handleShorten = async () => {
    try {
      setLoading(true);

      // Get current hash params and remove "edit"
      const hash = window.location.hash.slice(1); // Remove leading "#"
      const cleanedHash = setHashParamValueInHashString(
        hash,
        "edit",
        undefined,
      );

      // Store in S3 via API (SHA256 calculated on server)
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashParams: cleanedHash,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      // Get the SHA256 from the server response
      const data = await response.json();
      const sha256 = data.id;

      // Construct shortened URL and copy to clipboard
      const origin = window.location.origin;
      const shortUrl = `${origin}/j/${sha256}`;
      setShortenedUrl(shortUrl);

      // Copy to clipboard
      onCopy(shortUrl);
      setTimeout(() => {
        toast({
          title: "Shortened URL copied to clipboard",
          description: (
            <Link
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="sm"
              isExternal
            >
              {shortUrl}
            </Link>
          ),
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }, 0);
    } catch (error) {
      console.error("Shorten URL error:", error);
      toast({
        title: "Failed to shorten URL",
        description: "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="relative" display="inline-block">
      <Tooltip label="Shorten URL">
        <Icon
          aria-label="shorten url"
          _hover={{ bg: "gray.300" }}
          bg={"none"}
          p={"3px"}
          borderRadius={5}
          as={ArrowsInLineHorizontalIcon}
          boxSize="7"
          onClick={handleShorten}
          opacity={loading ? 0.5 : 1}
          cursor={loading ? "not-allowed" : "pointer"}
        />
      </Tooltip>
    </Box>
  );
};
