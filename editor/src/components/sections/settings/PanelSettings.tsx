import { Box, VStack } from '@chakra-ui/react';

import { SectionModules } from '/@/components/sections/settings/components/SectionModules';
import { PanelHeader } from '/@/components/common/PanelHeader';
import { SectionOptions } from '/@/components/sections/settings/components/SectionOptions';

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
          <SectionOptions />
        </VStack>
      </Box>
  );
};
