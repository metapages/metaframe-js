import React from "react";
import { HStack, Icon, Flex, Text, VStack, Link, Badge } from "@chakra-ui/react";
import { DownloadSimple } from "@phosphor-icons/react";
import { ButtonDeleteWithConfirm } from "./ButtonDeleteWithConfirm";

type DataRef = {
  type: string;
  value: string;
};

export const InputRow: React.FC<{
  name: string;
  dataref: DataRef;
  onDelete: () => void;
}> = ({ name, dataref, onDelete }) => {
  const value = dataref.value;
  const type = dataref.type || "url";

  // Check if value is a valid URL for display
  const isValidUrl = value.startsWith('http://') || value.startsWith('https://');

  return (
    <>
      <HStack gap={3} flex={1} alignItems="flex-start">
        <Icon cursor={'arrow'} as={DownloadSimple} boxSize={7} mt={1}></Icon>
        <VStack alignItems="flex-start" gap={1} flex={1}>
          <HStack>
            <Text fontWeight={600} wordBreak={'break-all'} whiteSpace={'normal'}>
              {name}
            </Text>
            <Badge colorScheme="blue" fontSize="xs">{type}</Badge>
          </HStack>
          {isValidUrl ? (
            <Link
              href={value}
              isExternal
              fontSize="sm"
              color="blue.500"
              wordBreak={'break-all'}
              whiteSpace={'normal'}
            >
              {value}
            </Link>
          ) : (
            <Text
              fontSize="sm"
              color="gray.600"
              wordBreak={'break-all'}
              whiteSpace={'normal'}
              maxW="100%"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {value.length > 100 ? `${value.substring(0, 100)}...` : value}
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
