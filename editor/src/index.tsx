import "@fontsource-variable/jetbrains-mono";
import { StrictMode } from 'react';

import { App } from '/@/App';
import { createRoot } from 'react-dom/client';
import { mfTheme } from "/@/styles/theme";

import {
  ChakraProvider,
} from '@chakra-ui/react';
import { WithMetaframe } from '@metapages/metaframe-hook';

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ChakraProvider theme={mfTheme}>
      <WithMetaframe>
        <App />
      </WithMetaframe>
    </ChakraProvider>
  </StrictMode>
);
