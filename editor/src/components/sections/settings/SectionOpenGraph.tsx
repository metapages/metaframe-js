import React, { useCallback, useRef, useState } from "react";

import {
  Box,
  Button,
  Image,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useHashParamJson } from "@metapages/hash-query/react-hooks";
import { uploadFile } from "/@/hooks/useFileUpload";

interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
}

export const SectionOpenGraph: React.FC = () => {
  const [og, setOg] = useHashParamJson<OpenGraphData | undefined>("og");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = og?.title || "";
  const description = og?.description || "";
  const image = og?.image;

  const updateOg = useCallback(
    (patch: Partial<OpenGraphData>) => {
      const next: OpenGraphData = { ...og, ...patch };
      // Remove undefined/empty values
      if (!next.title) delete next.title;
      if (!next.description) delete next.description;
      if (!next.image) delete next.image;
      // Set undefined (removes hash param) if empty object
      setOg(Object.keys(next).length === 0 ? undefined : next);
    },
    [og, setOg],
  );

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const result = await uploadFile(file);
        updateOg({ image: result.url });
      } catch (err) {
        console.error("OG image upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [updateOg],
  );

  return (
    <VStack align="stretch" gap={3} py={3} px={4}>
      <Text fontSize="sm" fontWeight="bold">
        Open Graph
      </Text>

      <Box>
        <Text fontSize="xs" mb={1}>
          Title
        </Text>
        <Input
          size="sm"
          value={title}
          onChange={(e) => updateOg({ title: e.target.value })}
          placeholder="Page title"
        />
      </Box>

      <Box>
        <Text fontSize="xs" mb={1}>
          Description
        </Text>
        <Textarea
          size="sm"
          value={description}
          onChange={(e) => updateOg({ description: e.target.value })}
          placeholder="Page description"
          rows={3}
        />
      </Box>

      <Box>
        <Text fontSize="xs" mb={1}>
          Image
        </Text>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          size="sm"
          onChange={handleImageChange}
          disabled={uploading}
          p={1}
        />
        {uploading && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Uploading...
          </Text>
        )}
        {image && (
          <Box mt={2} position="relative">
            <Image
              src={image}
              alt="OG preview"
              maxH="120px"
              objectFit="contain"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            />
            <Button
              size="xs"
              variant="ghost"
              position="absolute"
              top={0}
              right={0}
              onClick={() => {
                updateOg({ image: undefined });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Remove
            </Button>
          </Box>
        )}
      </Box>
    </VStack>
  );
};
