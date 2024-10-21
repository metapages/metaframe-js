import React from "react";
import { HStack, Text, Icon } from "@chakra-ui/react";
import { X } from "@phosphor-icons/react";
import { useStore } from "/@/store";
import { PanelHeaderContainer } from "/@/components/common/PanelHeaderContainer";

interface PanelHeaderProps {
  title: string;
  onSave?: () => void;
  preserveCase?: boolean;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title }) => {
  const setShownPanel = useStore(state => state.setShownPanel);
  const titleText = title.toUpperCase();
  return (
    <PanelHeaderContainer>
      <HStack justify={"space-between"} px={6} w={"100%"} bg={'gray.100'}>
        <Text fontSize={"0.7rem"}>{titleText}</Text>
        <HStack>
          <Icon boxSize={"1rem"} as={X} onClick={() => setShownPanel(null)}></Icon>
        </HStack>
      </HStack>
    </PanelHeaderContainer>
  );
};
