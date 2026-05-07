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
  const [isDesktop] = useMediaQuery("(min-width: 768px)");
  const { copyToClipboard } = useAiText();

  // only show the edit button if the command points to a script in the inputs
  const setShownPanel = useStore((state) => state.setShownPanel);
  const shownPanel = useStore((state) => state.shownPanel);
  const triggerFileUpload = useStore((state) => state.triggerFileUpload);

  const iconSize = isDesktop ? "7" : "48px";
  const iconPadding = isDesktop ? "3px" : "4px";

  const icon = (
    svg: React.ElementType,
    tooltipText: string,
    callback: () => void,
    hover?: boolean,
    testId?: string,
  ) => {
    return (
      <Box position="relative" display="inline-block" data-testid={testId}>
        <Tooltip label={`${capitalize(tooltipText)}`}>
          <Icon
            _hover={{ bg: hover ? "gray.300" : "none" }}
            bg={tooltipText === shownPanel ? "gray.300" : "none"}
            p={iconPadding}
            borderRadius={5}
            as={svg}
            boxSize={iconSize}
            onClick={callback}
          />
        </Tooltip>
      </Box>
    );
  };

  return (
    <HStack
      px={isDesktop ? 0 : "8px"}
      py={isDesktop ? 0 : "4px"}
      justify={"space-between"}
      minWidth={"100%"}
      h={isDesktop ? "headerHeight" : "auto"}
      bg={"gray.100"}
      borderBottom={"1px"}
      flexShrink={0}
    >
      <Button
        mx={isDesktop ? 5 : 0}
        onClick={() => setShownPanel(null)}
        variant={"ghost"}
        _hover={{ bg: "gray.300" }}
        fontWeight={isDesktop ? 400 : 500}
        color={"gray.600"}
        fontSize={isDesktop ? "md" : "24px"}
        px={isDesktop ? undefined : "8px"}
        h={isDesktop ? undefined : "44px"}
        minW={isDesktop ? undefined : "44px"}
        flexShrink={0}
      >
        {isDesktop ? "Javascript" : "JS"}
      </Button>
      <HStack
        borderLeft={isDesktop ? "1px" : "none"}
        right={0}
        px={isDesktop ? 4 : 0}
        bg={isDesktop ? "gray.100" : "transparent"}
        justifyContent={isDesktop ? "space-around" : "flex-end"}
        h={isDesktop ? "headerHeight" : "auto"}
        w={"auto"}
        spacing={isDesktop ? undefined : "12px"}
        flexWrap={isDesktop ? "nowrap" : "wrap"}
      >
        {icon(
          MagicWandIcon,
          "AI",
          () => copyToClipboard(),
          true,
          "ai-copy-button",
        )}
        {icon(UploadSimpleIcon, "upload", () => triggerFileUpload(), true)}
        {icon(
          GearIcon,
          "settings",
          () => setShownPanel(shownPanel === "settings" ? null : "settings"),
          true,
        )}
        <ButtonCopyExternalLink iconSize={iconSize} iconPadding={iconPadding} />
        <ButtonShortenUrl iconSize={iconSize} iconPadding={iconPadding} />
        {icon(
          QuestionMarkIcon,
          "docs",
          () => {
            const docsUrl = `${window.location.origin}/docs/`;
            (window.top || window).open(
              docsUrl,
              "_blank",
              "noopener,noreferrer",
            );
          },
          true,
        )}
        {icon(XIcon, "close", () => setEdit(false))}
      </HStack>
    </HStack>
  );
};
