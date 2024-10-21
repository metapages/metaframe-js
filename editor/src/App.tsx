import '/@/app.css';
import '/@/debug.css';
import React from 'react';
import { useStore } from '/@/store';

import { VStack } from '@chakra-ui/react';

import { MainHeader } from '/@/components/header/MainHeader';
import { PanelCode } from '/@/components/sections/code/PanelCode';
import { PanelDocs } from '/@/components/sections/help/PanelDocs';
import { PanelSettings } from '/@/components/sections/settings/PanelSettings';

export const App: React.FC = () => {
  const shownPanel = useStore(state => state.shownPanel);
  return (
    <VStack gap={0} minWidth={"200px"} w={'100%'} minHeight="100vh" overflow={'hidden'} borderLeft={'1px'}>
      <MainHeader />
      <PanelCode />
      {shownPanel === 'settings' && <PanelSettings />}
      {shownPanel === 'docs' && <PanelDocs />}
    </VStack>
  );
};