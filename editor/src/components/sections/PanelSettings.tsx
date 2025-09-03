import { PanelHeader } from '/@/components/common/PanelHeader';

import {
  Box,
  Divider,
  VStack,
} from '@chakra-ui/react';

import { SectionIO } from './settings/SectionIO';
import { SectionModules } from './settings/SectionModules';
import { SectionOptions } from './settings/SectionOptions';
import { SectionHashParams } from './settings/SectionHashParams';

export const PanelSettings: React.FC = () => {
  return (
      <Box
        position={'absolute'}
        borderLeft={'1px'}
        top={'3rem'}
        w={"100%"}
        h={"calc(100% - 3rem)"}
        right={0}
        overflowY="scroll"
        bg={'gray.100'}
      >
        <PanelHeader title={'settings'}/>
        <VStack h={"calc(100% - 1.5rem)"} gap={3}>
          <SectionModules />
          <Divider borderColor="#DEDEDE"/>
          <SectionIO />
          <Divider borderColor="#DEDEDE"/>
          <SectionHashParams />
          <Divider borderColor="#DEDEDE"/>
          {/* <Heading size={'md'}>Options</Heading> */}
          {/* <Div  ider /> */}
          <SectionOptions />
        </VStack>
      </Box>
  );
};
