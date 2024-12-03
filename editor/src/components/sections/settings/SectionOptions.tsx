import React from 'react';

import {
  Divider,
  VStack,
} from '@chakra-ui/react';

import { EditBgColor } from './EditBgColor';
import { EditButtonSettings } from './EditButtonSettings';
import { EditColorScheme } from './EditColorScheme';
import { EditEditorWidth } from './EditEditorWidth';

export const SectionOptions: React.FC = () => {
  return (
      <VStack
        w={'100%'}
        // p={6}
        gap={5}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <EditButtonSettings />
        <Divider />
        <EditColorScheme />
        <Divider />
        <EditBgColor />
        <Divider />
        <EditEditorWidth />
      </VStack>
  );
};
