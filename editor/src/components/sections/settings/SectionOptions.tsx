import React from 'react';

import {
  Divider,
  VStack,
} from '@chakra-ui/react';

import { CacheManagement } from './CacheManagement';
import { EditBgColor } from './EditBgColor';
import { EditButtonSettings } from './EditButtonSettings';
import { EditColorScheme } from './EditColorScheme';
import { EditDebugMode } from './EditDebugMode';
import { EditDisableCache } from './EditDisableCache';
import { EditDisableDatarefs } from './EditDisableDatarefs';
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
        <Divider />
        <EditDisableDatarefs />
        <Divider />
        <EditDisableCache />
        <Divider />
        <EditDebugMode />
        <Divider />
        <CacheManagement />
      </VStack>
  );
};
