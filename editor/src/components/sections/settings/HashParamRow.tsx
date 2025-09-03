import React from "react";
import { HStack, Icon, Flex, Text } from "@chakra-ui/react";
import { Hash } from "@phosphor-icons/react";
import { ButtonDeleteWithConfirm } from "./ButtonDeleteWithConfirm";

export const HashParamRow: React.FC<{
  name: string;
  onDelete: () => void;
}> = ({ name, onDelete }) => {
  return (
    <>
      <HStack gap={3} flex={1}>
        <Icon cursor={'arrow'} as={Hash} boxSize={7}></Icon>
        <Text wordBreak={'break-all'} whiteSpace={'normal'}>{name}</Text>
      </HStack>
      <Flex align={"center"} justify={"flex-end"} gap={3}>
        <ButtonDeleteWithConfirm 
          callback={onDelete} 
          modalHeader={`Are you sure you want to delete the hash parameter "${name}"?`}
        />
      </Flex>
    </>
  );
};
