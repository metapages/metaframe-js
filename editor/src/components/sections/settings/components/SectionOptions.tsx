import React from 'react';

import { VStack } from '@chakra-ui/react';

import { EditButtonSettings } from '/@/components/sections/settings/components/EditButtonSettings';
import { EditColorScheme } from '/@/components/sections/settings/components/EditColorScheme';
import { EditBgColor } from '/@/components/sections/settings/components/EditBgColor';

export const SectionOptions: React.FC = () => {

  return (
      <VStack
        w={'100%'}
        p={6}
        gap={8}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <EditButtonSettings />
        <EditColorScheme />
        <EditBgColor />
      </VStack>
  );
};
