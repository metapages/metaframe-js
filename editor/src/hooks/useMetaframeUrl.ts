import {
  useEffect,
  useState,
} from 'react';

import { ConfigOptions } from '/@/shared/config';

import {
  setHashParamValueBase64EncodedInUrl,
  setHashParamValueJsonInUrl,
  useHashParamBase64,
  useHashParamJson,
} from '@metapages/hash-query/react-hooks';
import { MetaframeDefinitionV1 } from '@metapages/metapage';

export const useMetaframeUrl = () => {
  const [url, setUrl] = useState<string>();
  const [code] = useHashParamBase64("js");
  const [config] = useHashParamJson<ConfigOptions>("c");
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
    if (config) {
      url = setHashParamValueJsonInUrl(url, "c", config);
    }

    // I am not sure about this anymore
    url.pathname = "";
    url.host = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[0];
    url.port = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[1];

    let href = url.href;
    // WATCH THIS DIFFERENCE BETWEEN THIS AND BELOW
    // 1!
    if (code) {
      let checkedCode = code;
      if (code && (code.startsWith("%") || (code.indexOf("\n") === -1 && code.indexOf("%") > -1))) {
        checkedCode = decodeURIComponent(code);
      }
      href = setHashParamValueBase64EncodedInUrl(href, "js", checkedCode).href;
      // url.hash = setHashParamValueBase64InHashString(
      //   url.hash,
      //   "js",
      //   stringToBase64String(code)
      // );
    }
    // Remove the c and v hash params since they are set in the searchParams
    // url.hash = setHashValueInHashString(url.hash, "c", null);
    // url.hash = setHashValueInHashString(url.hash, "v", null);
    setUrl(href);
  }, [config, code, metaframeDef, modules, setUrl]);

  return { url };
};
