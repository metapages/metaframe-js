import { useCallback, useState } from "react";

import {
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Badge,
  useToast,
  Spinner,
  FormControl,
} from "@chakra-ui/react";

export const CacheManagement: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const clearCache = useCallback(async () => {
    // @ts-ignore
    if (!window.parent?.serviceWorkerManager) {
      toast({
        title: "Cache Not Available",
        description: "Service worker cache management is not available",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsClearing(true);
    try {
      // @ts-ignore
      await window.parent.serviceWorkerManager.clearCache();
      toast({
        title: "Cache Cleared",
        description: "All cached resources have been cleared successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCacheInfo(null);
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear cache",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsClearing(false);
    }
  }, [toast]);

  const loadCacheInfo = useCallback(async () => {
    // @ts-ignore
    if (!window.parent?.serviceWorkerManager) return;

    setIsLoading(true);
    try {
      // @ts-ignore
      const info = await window.parent.serviceWorkerManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error("Failed to load cache info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <FormControl pb="1rem" p={6}>
      <Text fontWeight={700} pb={2}>
        Cache Management
      </Text>
      <Text fontSize="sm" color="gray.600" pb={3}>
        Manage cached JavaScript, CSS, and other external resources
      </Text>

      <VStack align="flex-start" w="100%" spacing={3}>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={loadCacheInfo}
          isLoading={isLoading}
          loadingText="Loading..."
          w="100%"
        >
          {isLoading ? <Spinner size="xs" /> : "Show Cache Info"}
        </Button>

        {cacheInfo && (
          <Box w="100%" p={3} bg="gray.50" borderRadius="md" fontSize="sm">
            <Text fontWeight={600}>Cache Status:</Text>
            <Text>Version: {cacheInfo.version}</Text>
            <Text>
              Cached Resources:{" "}
              <Badge colorScheme="blue">{cacheInfo.count}</Badge>
            </Text>
            {cacheInfo.urls && cacheInfo.urls.length > 0 && (
              <Box mt={2}>
                <Text fontWeight={600} fontSize="xs">
                  Recent URLs:
                </Text>
                {cacheInfo.urls.slice(0, 3).map((url: string, idx: number) => (
                  <Text key={idx} fontSize="xs" color="gray.600" isTruncated>
                    {url.split("/").pop() || url}
                  </Text>
                ))}
                {cacheInfo.urls.length > 3 && (
                  <Text fontSize="xs" color="gray.500">
                    ...and {cacheInfo.urls.length - 3} more
                  </Text>
                )}
              </Box>
            )}
          </Box>
        )}

        <Button
          colorScheme="red"
          size="sm"
          onClick={clearCache}
          isLoading={isClearing}
          loadingText="Clearing..."
          w="100%"
        >
          {isClearing ? <Spinner size="xs" /> : "Clear All Cache"}
        </Button>
      </VStack>
    </FormControl>
  );
};
