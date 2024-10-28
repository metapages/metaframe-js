import React from 'react';

import { VStack } from '@chakra-ui/react';

import { EditButtonSettings } from './EditButtonSettings';
import { EditColorScheme } from './EditColorScheme';
import { EditBgColor } from './EditBgColor';
import { EditEditorWidth } from './EditEditorWidth';

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
