import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useToast } from '@chakra-ui/react';
import {
  getHashParamValueJsonFromWindow,
  useHashParamBase64,
} from '@metapages/hash-query/react-hooks';
import { useMetaframe } from '@metapages/metapage-react/hooks';

import { DataRef } from '../components/sections/settings/SectionInputs';

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
  const metaframeBlob = useMetaframe();

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
      let text = fullAiText;
      // Add the metaframe inputs, if any, to help the LLM understand the context
      let inputsFromUrl: Record<string, DataRef> | undefined;
      try {
        inputsFromUrl = getHashParamValueJsonFromWindow("inputs");
      } catch (err) {
        console.error("Error getting inputs from url", err);
        return;
      }
      if (!inputsFromUrl) {
        inputsFromUrl = {};
      }
      const metaframeInputs = metaframeBlob.metaframe?.getInputs();
      if (metaframeInputs) {
        for (const [key, value] of Object.entries(metaframeInputs)) {
          inputsFromUrl[key] = value;
        }
      }
      if (Object.keys(inputsFromUrl).length > 0) {
        let inputsString = "";
        Object.entries(inputsFromUrl).forEach(([key, value]) => {
          inputsString += `  - ${key}: ${typeof(value) === "string" ? value : JSON.stringify(value).substring(0, 4000)}...\n`;
        });
        
        text = text.replace("<insert current inputs here, if any>", `\n\nAll metaframe inputs (not always at the same time): \n${inputsString.length < 8000 ? inputsString : inputsString.substring(0, 8000) + "..."}`);
      }

      await navigator.clipboard.writeText(text);
      toast({
        title: "AI Prompt copied to clipboard",
        description:
          "Now paste into e.g. Claude Code or ChatGPT, or any other AI tool that supports code.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error copying to clipboard", err);
      toast({
        title: "Failed to copy to clipboard",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fullAiText, toast, metaframeBlob]);

  return { aiText: fullAiText, copyToClipboard: handleCopyToClipboard };
};
