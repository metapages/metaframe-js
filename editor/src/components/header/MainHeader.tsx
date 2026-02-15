import React from "react";

import { useAiText } from "/@/hooks/useAiText";
import { useStore } from "/@/store";

import {
  Box,
  Button,
  HStack,
  Icon,
  Tooltip,
  useMediaQuery,
} from "@chakra-ui/react";
import { useHashParamBoolean } from "@metapages/hash-query/react-hooks";
import {
  GearIcon,
  MagicWandIcon,
  QuestionMarkIcon,
  UploadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";

import { ButtonCopyExternalLink } from "./components/ButtonCopyExternalLink";
import { ButtonShortenUrl } from "./components/ButtonShortenUrl";

export const capitalize = (str: string): string => {
  if (!str.length) return str;
  return str[0].toUpperCase() + str.slice(1, str.length);
};

export const MainHeader: React.FC = () => {
  const [_edit, setEdit] = useHashParamBoolean("edit");
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");
  const { copyToClipboard } = useAiText();

  // only show the edit button if the command points to a script in the inputs
  const setShownPanel = useStore((state) => state.setShownPanel);
  const shownPanel = useStore((state) => state.shownPanel);
  const triggerFileUpload = useStore((state) => state.triggerFileUpload);

  const icon = (
    svg: React.ElementType,
    tooltipText: string,
    callback: () => void,
    hover?: boolean,
  ) => {
    return (
      <Box position="relative" display="inline-block">
        <Tooltip label={`${capitalize(tooltipText)}`}>
          <Icon
            _hover={{ bg: hover ? "gray.300" : "none" }}
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
  if (!isLargerThan400) {
    return (
      <HStack
        p={5}
        justify={"flex-end"}
        minW={"100%"}
        h={"headerHeight"}
        bg={"gray.100"}
        borderBottom={"1px"}
      >
        {icon(
          GearIcon,
          "settings",
          () => setShownPanel(shownPanel === "settings" ? null : "settings"),
          true,
        )}
        {icon(XIcon, "close", () => setEdit(false))}
      </HStack>
    );
  }

  return (
    <HStack
      p={0}
      justify={"space-between"}
      minWidth={"100%"}
      h={"headerHeight"}
      bg={"gray.100"}
      borderBottom={"1px"}
    >
      <Button
        mx={5}
        onClick={() => setShownPanel(null)}
        variant={"ghost"}
        _hover={{ bg: "gray.300" }}
        fontWeight={400}
        color={"gray.600"}
      >
        Javascript
      </Button>
      <HStack
        borderLeft={"1px"}
        right={0}
        px={4}
        bg={"gray.100"}
        justifyContent={"space-around"}
        h={"headerHeight"}
        w={"auto"}
      >
        {icon(
          MagicWandIcon,
          "AI",
          () => copyToClipboard(),
          // () => setShownPanel(shownPanel === "ai" ? null : "ai"),
          true,
        )}
        {icon(UploadSimpleIcon, "upload", () => triggerFileUpload(), true)}
        {icon(
          GearIcon,
          "settings",
          () => setShownPanel(shownPanel === "settings" ? null : "settings"),
          true,
        )}
        <ButtonCopyExternalLink />
        <ButtonShortenUrl />
        {/* <ButtonGotoExternalLink /> */}
        {icon(
          QuestionMarkIcon,
          "docs",
          () => setShownPanel(shownPanel === "docs" ? null : "docs"),
          true,
        )}
        {icon(XIcon, "close", () => setEdit(false))}
      </HStack>
    </HStack>
  );
};
