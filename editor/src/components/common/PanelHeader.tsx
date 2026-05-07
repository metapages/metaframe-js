import React from "react";
import { HStack, Text, Icon, useMediaQuery } from "@chakra-ui/react";
import { X } from "@phosphor-icons/react";
import { useStore } from "/@/store";
import { PanelHeaderContainer } from "/@/components/common/PanelHeaderContainer";

interface PanelHeaderProps {
  title: string;
  onSave?: () => void;
  preserveCase?: boolean;
  children?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  children,
}) => {
  const setShownPanel = useStore((state) => state.setShownPanel);
  const [isDesktop] = useMediaQuery("(min-width: 768px)");
  const titleText = title.toUpperCase();
  return (
    <PanelHeaderContainer>
      <HStack
        justify={"space-between"}
        px={isDesktop ? 6 : 4}
        py={2}
        w={"100%"}
        h="100%"
      >
        <Text
          fontSize={isDesktop ? "0.7rem" : "0.9rem"}
          fontWeight={isDesktop ? 400 : 600}
        >
          {titleText}
        </Text>
        <HStack spacing={4} justify="center" flex="1" h="100%" align="center">
          {children}
        </HStack>
        <Icon
          boxSize={isDesktop ? "1rem" : "32px"}
          p={isDesktop ? 0 : "4px"}
          as={X}
          _hover={{ bg: "gray.300" }}
          borderRadius={4}
          onClick={() => setShownPanel(null)}
        />
      </HStack>
    </PanelHeaderContainer>
  );
};
