import React from "react";

import { useStore } from "/@/store";

import {Box, HStack, Icon, Text, Tooltip } from "@chakra-ui/react";
import { useHashParam } from "@metapages/hash-query";
import { Gear, X, QuestionMark } from "@phosphor-icons/react";
import { ButtonCopyExternalLink } from "./components/ButtonCopyExternalLink";
import { ButtonGotoExternalLink } from "./components/ButtonGotoExternalLink";

export const capitalize = (str: string): string => {
  if (!str.length) return str;
  return str[0].toUpperCase() + str.slice(1, str.length);
};

export const MainHeader: React.FC = () => {
  const [_edit, setEdit] = useHashParam("edit", "true");

  // only show the edit button if the command points to a script in the inputs
  const setShownPanel = useStore(state => state.setShownPanel);
  const shownPanel = useStore(state => state.shownPanel);

  const icon = (svg: React.ElementType, tooltipText: string, callback: () => void, hover?: boolean) => {
    return (
      <Box position="relative" display="inline-block">
        <Tooltip label={`${capitalize(tooltipText)}`}>
          <Icon
            _hover={{ bg: hover ? "gray.300" : 'none' }}
            bg={tooltipText === shownPanel ? "gray.300" : "none"}
            p={"3px"}
            borderRadius={5}
            as={svg}
            boxSize="7"
            onClick={callback}
          />
        </Tooltip>
      </Box>
    );
  };

  return (
    <HStack p={0} justify={"space-between"} minWidth={"100%"} h={"headerHeight"} bg={"gray.100"} borderBottom={"1px"}>
      <HStack px={5}>
        <Text>Javascript</Text>
      </HStack>
      <HStack borderLeft={"1px"} right={0} px={4} bg={"gray.100"} justifyContent={"space-around"} h={'headerHeight'} w={'16rem'}>
        {icon(Gear, "settings", () => setShownPanel(shownPanel === "settings" ? null : "settings"), true)}
        {icon(QuestionMark, "docs", () => setShownPanel(shownPanel === "docs" ? null : "docs"), true)}
        <ButtonCopyExternalLink/>
        <ButtonGotoExternalLink />
        {icon(X, "close", () => setEdit("false"))}
      </HStack>
    </HStack>
  );
};
