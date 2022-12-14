import { EditIcon, InfoIcon, PlusSquareIcon } from "@chakra-ui/icons";
import {
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
} from "@chakra-ui/react";
import { PanelCode } from "/@/components/PanelCode";
import { PanelHelp } from "/@/components/PanelHelp";
import { PanelModules } from "/@/components/PanelModules";
import { ButtonGotoExternalLink } from "/@/components/ButtonGotoExternalLink";
import { ButtonCopyExternalLink } from "/@/components/ButtoCopyExternalLink";
import { ButtonGithub } from "/@/components/ButtonGithub";
import "/@/app.css";
import { PanelOptions } from "/@/components/PanelOptions";

export const App: React.FC = () => {
  return (
    <Tabs>
      <TabList>
        <Tab>
          <EditIcon /> &nbsp; Code
        </Tab>
        <Tab>
          <PlusSquareIcon /> &nbsp; Modules
        </Tab>
        <Tab>
           Options
        </Tab>
        <Tab>
          <InfoIcon /> &nbsp; Help
        </Tab>

        <Spacer />
        <Stack p={1} spacing={4} direction="row" align="center">
          <ButtonCopyExternalLink /> <ButtonGotoExternalLink /> <ButtonGithub />
        </Stack>
      </TabList>

      <TabPanels>
        <TabPanel>
          <PanelCode />
        </TabPanel>
        <TabPanel>
          <PanelModules />
        </TabPanel>
        <TabPanel>
          <PanelOptions />
        </TabPanel>
        <TabPanel>
          <PanelHelp />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
