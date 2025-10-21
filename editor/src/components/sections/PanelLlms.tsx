import React, { useEffect, useState } from 'react';

import { PanelHeader } from '/@/components/common/PanelHeader';

import {
  Box,
  Button,
  Code,
  HStack,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Copy } from '@phosphor-icons/react';

export const PanelLlms: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchLlmsContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/llms.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch llms.txt');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLlmsContent();
  }, []);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied LLMs guide to clipboard",
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
  };

  return (
    <Box
      position={'absolute'}
      borderLeft={'1px'}
      top={'3rem'}
      w={"100%"}
      h={"calc(100vh - 3rem)"}
      right={0}
      overflowY="scroll"
      bg={'gray.100'}
    >
      <PanelHeader title={'LLMs Guide'}>
        <Button
          leftIcon={<Copy size={16} />}
          size="sm"
          onClick={handleCopyToClipboard}
          isDisabled={isLoading || !!error || !content}
          variant="ghost"
          _hover={{ bg: "gray.200" }}
          borderRadius="md"
          px={3}
          py={5}
          h="auto"
          minH="auto"
          maxH="calc(100% - 20px)"
        >
          Copy (then paste into LLM prompt)
        </Button>
      </PanelHeader>
      
      <Box p={6}>
        {isLoading && (
          <VStack spacing={4}>
            <Spinner size="lg" />
            <Text>Loading LLMs guide...</Text>
          </VStack>
        )}
        
        {error && (
          <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
            <Text color="red.600" fontWeight="bold">Error loading content:</Text>
            <Text color="red.500">{error}</Text>
          </Box>
        )}
        
        {content && !isLoading && !error && (
          <Code
            display="block"
            whiteSpace="pre-wrap"
            p={4}
            bg="gray.50"
            borderRadius="md"
            fontSize="sm"
            lineHeight="1.6"
            overflowX="auto"
          >
            {content}
          </Code>
        )}
      </Box>
    </Box>
  );
};
