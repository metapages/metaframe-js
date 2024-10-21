import { Box, VStack } from '@chakra-ui/react';

import { SectionModules } from '/@/components/sections/settings/components/SectionModules';
import { PanelHeader } from '/@/components/common/PanelHeader';
import { SectionOptions } from '/@/components/sections/settings/components/SectionOptions';

// TODO fix height variable
export const PanelSettings: React.FC = () => {
  return (
      <Box
        position={'absolute'}
        borderLeft={'1px'}
        top={'3rem'}
        bg={'white'}
        w={"calc(100% - 4rem)"}
        h={"calc(100% - 3rem)"}
        right={0}
        overflowY="scroll"
      >
        <PanelHeader title={'settings'}/>
        <VStack bg={'gray.100'}  h={"calc(100% - 1.5rem)"} gap={6}>
          <SectionModules />
          <SectionOptions />
        </VStack>
      </Box>
  );
};
