import { PanelHeader } from "/@/components/common/PanelHeader";

import {
  Box,
  Divider,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";

import { CacheManagement } from "./settings/CacheManagement";
import { EditBgColor } from "./settings/EditBgColor";
import { EditButtonSettings } from "./settings/EditButtonSettings";
import { EditColorScheme } from "./settings/EditColorScheme";
import { EditDebugMode } from "./settings/EditDebugMode";
import { EditDisableCache } from "./settings/EditDisableCache";
import { EditDisableDatarefs } from "./settings/EditDisableDatarefs";
import { EditDisableSmartInputUnpacking } from "./settings/EditDisableSmartInputUnpacking";
import { EditEditorWidth } from "./settings/EditEditorWidth";
import { SectionHashParams } from "./settings/SectionHashParams";
import { SectionInputs } from "./settings/SectionInputs";
import { SectionIO } from "./settings/SectionIO";
import { SectionModules } from "./settings/SectionModules";
import { SectionOpenGraph } from "./settings/SectionOpenGraph";

export const PanelSettings: React.FC = () => {
  return (
    <Box
      position={"absolute"}
      borderLeft={"1px"}
      top={0}
      w={"100%"}
      h={"100%"}
      right={0}
      bg={"gray.100"}
    >
      <Flex direction="column" h="100%">
        <PanelHeader title={"settings"} />
        <Tabs
          display="flex"
          flexDirection="column"
          flex={1}
          minH={0}
          variant="line"
          colorScheme="blue"
          size="sm"
        >
          <TabList
            px={2}
            bg="gray.100"
            borderBottom="1px solid"
            borderBottomColor="gray.300"
          >
            <Tab
              fontSize="xs"
              py={1.5}
              mb="-1px"
              _selected={{ color: "blue.600", borderBottomColor: "blue.600" }}
            >
              Runtime
            </Tab>
            <Tab
              fontSize="xs"
              py={1.5}
              mb="-1px"
              _selected={{ color: "blue.600", borderBottomColor: "blue.600" }}
            >
              Appearance
            </Tab>
            <Tab
              fontSize="xs"
              py={1.5}
              mb="-1px"
              _selected={{ color: "blue.600", borderBottomColor: "blue.600" }}
            >
              Open Graph
            </Tab>
            <Tab
              fontSize="xs"
              py={1.5}
              mb="-1px"
              _selected={{ color: "blue.600", borderBottomColor: "blue.600" }}
            >
              Advanced
            </Tab>
          </TabList>
          <TabPanels flex={1} minH={0} overflowY="auto">
            <TabPanel p={0}>
              <VStack gap={3} py={3}>
                <SectionModules />
                <Divider borderColor="#DEDEDE" />
                <SectionInputs />
                <Divider borderColor="#DEDEDE" />
                <SectionHashParams />
              </VStack>
            </TabPanel>
            <TabPanel p={0}>
              <VStack gap={3} py={3}>
                <EditButtonSettings />
                <Divider borderColor="#DEDEDE" />
                <EditColorScheme />
                <Divider borderColor="#DEDEDE" />
                <EditBgColor />
                <Divider borderColor="#DEDEDE" />
                <EditEditorWidth />
              </VStack>
            </TabPanel>
            <TabPanel p={0}>
              <SectionOpenGraph />
            </TabPanel>
            <TabPanel p={0}>
              <VStack gap={3} py={3}>
                <SectionIO />
                <Divider borderColor="#DEDEDE" />
                <EditDisableDatarefs />
                <Divider borderColor="#DEDEDE" />
                <EditDisableSmartInputUnpacking />
                <Divider borderColor="#DEDEDE" />
                <EditDisableCache />
                <Divider borderColor="#DEDEDE" />
                <EditDebugMode />
                <Divider borderColor="#DEDEDE" />
                <CacheManagement />
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
};
