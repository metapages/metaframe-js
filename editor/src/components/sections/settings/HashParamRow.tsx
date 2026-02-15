import React from "react";
import { HStack, Icon, Flex, Text, Button, VStack } from "@chakra-ui/react";
import { Hash, PencilSimple } from "@phosphor-icons/react";
import { HashParamDefinition } from "@metapages/metapage";
import { ButtonDeleteWithConfirm } from "./ButtonDeleteWithConfirm";

export const HashParamRow: React.FC<{
  name: string;
  metadata?: HashParamDefinition;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ name, metadata, onDelete, onEdit }) => {
  return (
    <>
      <HStack gap={3} flex={1} alignItems="flex-start">
        <Icon cursor={"arrow"} as={Hash} boxSize={7} mt={1}></Icon>
        <VStack alignItems="flex-start" gap={0} flex={1}>
          <Text wordBreak={"break-all"} whiteSpace={"normal"} fontWeight={500}>
            {name}
          </Text>
          {metadata && (
            <>
              <Text
                fontSize="sm"
                color="gray.600"
                wordBreak={"break-all"}
                whiteSpace={"normal"}
              >
                {metadata.label} ({metadata.type})
              </Text>
              {metadata.description && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  wordBreak={"break-all"}
                  whiteSpace={"normal"}
                >
                  {metadata.description}
                </Text>
              )}
            </>
          )}
        </VStack>
      </HStack>
      <Flex align={"center"} justify={"flex-end"} gap={3}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Icon as={PencilSimple} boxSize={4} />}
          onClick={onEdit}
          aria-label="edit hash parameter"
        >
          Edit
        </Button>
        <ButtonDeleteWithConfirm
          callback={onDelete}
          modalHeader={`Are you sure you want to delete the hash parameter "${name}"?`}
        />
      </Flex>
    </>
  );
};
