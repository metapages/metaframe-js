import React, {
  useCallback,
  useRef,
} from 'react';
import stringify from "safe-stable-stringify";

import { useMetaframeUrl } from '/@/hooks/useMetaframeUrl';

import { useHashParamBase64 } from '@metapages/hash-query';
import { MetaframeInputMap } from '@metapages/metapage';
import { MetaframeStandaloneComponent } from '@metapages/metapage-react';
import { Box } from '@chakra-ui/react';
import { useOptions } from '/@/hooks/useOptions';
import { useIsReadOnly } from "/@/hooks/isReadOnly";

export const encodeOptions = (options: any): string => {
  const text: string = stringify(options) || "";
  const b64 = btoa(encodeURIComponent(text));
  return b64;
};

export const PanelCode: React.FC = () => {
  const [code, setCode] = useHashParamBase64("js");
  const { url } = useMetaframeUrl();
  return (
      url ? <LocalEditor code={code} setCode={setCode} /> : <></>
  );
};

const LocalEditor: React.FC<{
  code: string;
  setCode: (code: string) => void;
}> = ({ code, setCode }) => {
  const [themeOptions] = useOptions();
  // only use the code prop initially, but then ignore so we don't get clobbering
  const codeInternal = useRef<string>(code);
  const inputs = useRef<{ text: string }>({ text: codeInternal.current });
  const isReadOnly = useIsReadOnly()

  const urlWithOptions = () => {
    const options =  encodeOptions({
      autosend: true,
      hidemenuififrame: true,
      mode: "javascript",
      theme: themeOptions?.theme || "vs-light",
      readOnly: isReadOnly
    });
    return `https://editor.mtfm.io/#?hm=disabled&options=${options}`
  }

  const onCodeOutputsUpdate = useCallback(
    (outputs: MetaframeInputMap) => {
      setCode(outputs.text);
    },
    [setCode]
  );

  return (
   <Box overflow={'hidden'} h={'panelContentHeight'} minH={`calc(100vh - 3rem)`} w={"100%"} bg={'white'}>
      <MetaframeStandaloneComponent
        url={urlWithOptions()}
        inputs={inputs.current}
        onOutputs={onCodeOutputsUpdate}
      />
    </Box>
  );
};
