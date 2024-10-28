import React from 'react';

import { VStack } from '@chakra-ui/react';

import { EditButtonSettings } from '/@/components/sections/settings/components/EditButtonSettings';
import { EditColorScheme } from '/@/components/sections/settings/components/EditColorScheme';
import { EditBgColor } from '/@/components/sections/settings/components/EditBgColor';
import { EditEditorWidth } from '/@/components/sections/settings/components/EditEditorWidth';

export const SectionOptions: React.FC = () => {
  return (
      <VStack
        w={'100%'}
        p={6}
        gap={5}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <EditButtonSettings />
        <EditColorScheme />
        <EditBgColor />
        <EditEditorWidth />
      </VStack>
  );
};
