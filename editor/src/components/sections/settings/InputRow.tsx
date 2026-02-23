import React, { useCallback } from "react";

import {
  Badge,
  Flex,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DownloadSimple } from "@phosphor-icons/react";

import { ButtonDeleteWithConfirm } from "./ButtonDeleteWithConfirm";
import { DataRef } from "./SectionInputs";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const InputRow: React.FC<{
  name: string;
  dataref: DataRef;
  onDelete: () => void;
}> = ({ name, dataref, onDelete }) => {
  const value = dataref.value;
  const type = dataref.type || "json";

  // Check if value is a valid URL for display
  const isValidUrl =
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"));

  const handleDownload = useCallback(() => {
    if (type === "url" && typeof value === "string") {
      window.open(value, "_blank");
    } else if (type === "base64" && typeof value === "string") {
      const binary = atob(value);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      triggerDownload(new Blob([bytes]), name);
    } else {
      const json = JSON.stringify(value, null, 2);
      triggerDownload(
        new Blob([json], { type: "application/json" }),
        `${name}.json`,
      );
    }
  }, [name, type, value]);

  return (
    <>
      <HStack gap={3} flex={1} alignItems="flex-start">
        <Icon
          cursor={"pointer"}
          as={DownloadSimple}
          boxSize={7}
          mt={1}
          onClick={handleDownload}
          _hover={{ color: "blue.500" }}
        ></Icon>
        <VStack alignItems="flex-start" gap={1} flex={1}>
          <HStack>
            <Text
              fontWeight={600}
              wordBreak={"break-all"}
              whiteSpace={"normal"}
            >
              {name}
            </Text>
            <Badge colorScheme="blue" fontSize="xs">
              {type}
            </Badge>
          </HStack>
          {isValidUrl ? (
            <Link
              href={value}
              isExternal
              fontSize="sm"
              color="blue.500"
              wordBreak={"break-all"}
              whiteSpace={"normal"}
            >
              {value}
            </Link>
          ) : (
            <Text
              fontSize="sm"
              color="gray.600"
              wordBreak={"break-all"}
              whiteSpace={"normal"}
              maxW="100%"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {typeof value === "string" && value.length > 100
                ? `${value?.substring(0, 100) || ""}...`
                : `${JSON.stringify(value)?.substring(0, 100) || ""}...`}
            </Text>
          )}
        </VStack>
      </HStack>
      <Flex align={"center"} justify={"flex-end"} gap={3}>
        <ButtonDeleteWithConfirm
          callback={onDelete}
          modalHeader={`Are you sure you want to delete the input "${name}"?`}
        />
      </Flex>
    </>
  );
};
