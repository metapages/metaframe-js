import React from "react";
import { Tr, Td, HStack, Icon, Flex, Text } from "@chakra-ui/react";
import { Code } from "@phosphor-icons/react";
import { ButtonDeleteWithConfirm } from "./ButtonDeleteWithConfirm";

export const InputRow: React.FC<{
  name: string;
  content: string;
  onDelete: (name: string) => void;
}> = ({ name, content, onDelete }) => {
  return (
    <Tr>
      <Td>
        <HStack gap={3}>
          <Icon cursor={'arrow'} as={Code} boxSize={7}></Icon>
          <Text wordBreak={'break-all'} whiteSpace={'normal'}>{name}</Text>
        </HStack>
      </Td>
      <Td>
        <Flex align={"center"} justify={"flex-end"} gap={3}>
          <ButtonDeleteWithConfirm callback={() => onDelete(name)} />
        </Flex>
      </Td>
    </Tr>
  );
};
