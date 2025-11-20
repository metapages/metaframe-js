import { useCallback, useEffect, useState } from "react";

import { useToast } from "@chakra-ui/react";
import { getHashParamValueBase64DecodedFromUrl } from "@metapages/hash-query";
import { useHashParamBase64 } from "@metapages/hash-query/react-hooks";

const llmsCode = `// Your code here:
export const onInputs = (inputs) => {
  // Your implementation
};`;

export const useAiText = (): {
  aiText: string;
  copyToClipboard: () => Promise<void>;
} => {
  const [aiBaseContent, setAiBaseContent] = useState<string>("");
  const [code] = useHashParamBase64("js");
  const [fullAiText, setFullAiText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchLlmsContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/llms.txt");
        if (!response.ok) {
          throw new Error("Failed to fetch llms.txt");
        }
        const text = await response.text();
        // setAiBaseContent(text.replace(llmsCode, ""));
        setAiBaseContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLlmsContent();
  }, []);
  useEffect(() => {
    if (!aiBaseContent) {
      return;
    }
    if (code) {
      setFullAiText(aiBaseContent.replace(llmsCode, "") + code);
    } else {
      setFullAiText(aiBaseContent);
    }
  }, [code, aiBaseContent]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      if (!fullAiText) return;
      await navigator.clipboard.writeText(fullAiText);
      toast({
        title: "AI Prompt copied to clipboard",
        description:
          "Now paste into e.g. Claude Code or ChatGPT, or any other AI tool that supports code.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy to clipboard",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fullAiText, toast]);

  return { aiText: fullAiText, copyToClipboard: handleCopyToClipboard };
};
