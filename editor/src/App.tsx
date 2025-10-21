import '/@/app.css';
import '/@/debug.css';
import React from 'react';
import { useStore } from '/@/store';

import { VStack } from '@chakra-ui/react';

import { MainHeader } from '/@/components/header/MainHeader';
import { PanelCode } from './components/sections/PanelCode';
import { PanelDocs } from '/@/components/sections/PanelDocs';
import { PanelSettings } from './components/sections/PanelSettings';

export const App: React.FC = () => {
  const shownPanel = useStore(state => state.shownPanel);
  let content = <PanelCode />;
  if (shownPanel === 'settings') content = <PanelSettings />;
  if (shownPanel === 'docs') content = <PanelDocs />;
  return (
    <VStack gap={0} w={'100%'} minHeight="100vh" overflow={'hidden'} borderLeft={'1px'}>
      <MainHeader />
      {content}
    </VStack>
  );
};