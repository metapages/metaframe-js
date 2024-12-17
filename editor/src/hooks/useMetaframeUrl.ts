import {
  useEffect,
  useState,
} from 'react';

import { ConfigOptions } from '/@/shared/config';

import {
  stringToBase64String,
  useHashParamBase64,
  useHashParamJson,
  setHashParamValueJsonInUrl
} from '@metapages/hash-query/react-hooks';
import { MetaframeDefinitionV6 } from '@metapages/metapage';

export const useMetaframeUrl = () => {
  const [url, setUrl] = useState<string>();
  const [code] = useHashParamBase64("js");
  const [config] = useHashParamJson<ConfigOptions>("c");
  const [metaframeDef] = useHashParamJson<MetaframeDefinitionV6>("mfjson");
  const [modules] = useHashParamJson<string[]>("modules");

  // update the url
  useEffect(() => {
    let hash = window.location.hash.substring(1);
    let hashParams = new URLSearchParams(hash);
    // const url = new URL(window.location.href);
    let href = window.location.href;
    if (metaframeDef) {
      href = setHashParamValueJsonInUrl(href, "mfjson", metaframeDef);
    }
    if (modules) {
      href = setHashParamValueJsonInUrl(href, "modules", modules);
    }
    if (config) {
      href = setHashParamValueJsonInUrl(href, "c", config);
    }

    const currentUrl = new URL(href);

    // I am not sure about this anymore
    currentUrl.pathname = "";
    currentUrl.host = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[0];
    currentUrl.port = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[1];

    // WATCH THIS DIFFERENCE BETWEEN THIS AND BELOW
    // 1!
    if (code) {
      currentUrl.hash = setHashParamValueJsonInUrl(
        currentUrl.toString(),
        "js",
        stringToBase64String(code)
      );
    }
    // Remove the c and v hash params since they are set in the searchParams
    // url.hash = setHashValueInHashString(url.hash, "c", null);
    // url.hash = setHashValueInHashString(url.hash, "v", null);
    setUrl(currentUrl.href);
  }, [config, code, metaframeDef, modules, setUrl]);

  return { url };
};
