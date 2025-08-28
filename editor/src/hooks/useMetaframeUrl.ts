import {
  useEffect,
  useState,
} from 'react';

import {
  setHashParamValueBase64EncodedInUrl,
  setHashParamValueInUrl,
  setHashParamValueJsonInUrl,
  useHashParamBase64,
  useHashParamJson,
} from '@metapages/hash-query/react-hooks';
import { MetaframeDefinitionV1 } from '@metapages/metapage';

export const useMetaframeUrl = () => {
  const [url, setUrl] = useState<string>();
  const [code] = useHashParamBase64("js");
  const [metaframeDef] = useHashParamJson<MetaframeDefinitionV1>("definition");
  const [modules] = useHashParamJson<string[]>("modules");

  // update the url
  useEffect(() => {
    let url = new URL(window.location.href);
    if (metaframeDef) {
      url = setHashParamValueJsonInUrl(url, "definition", metaframeDef);
    }
    if (modules) {
      url = setHashParamValueJsonInUrl(url, "modules", modules);
    }

    // I am not sure about this anymore
    url.pathname = "";
    url.host = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[0];
    url.port = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[1];

    // let href = url.href;
    // WATCH THIS DIFFERENCE BETWEEN THIS AND BELOW
    // 1!
    if (code) {
      let checkedCode = code;
      if (code && (code.startsWith("%") || (code.indexOf("\n") === -1 && code.indexOf("%") > -1))) {
        checkedCode = decodeURIComponent(code);
      }
      url = setHashParamValueBase64EncodedInUrl(url, "js", checkedCode);
    }
    // Remove the c and v hash params since they are set in the searchParams
      url = setHashParamValueInUrl(url, "c", null);
      url = setHashParamValueInUrl(url, "v", null);
    setUrl(url.href);
  }, [code, metaframeDef, modules, setUrl]);

  return { url };
};
