import {
  useEffect,
  useState,
} from 'react';

import { ConfigOptions } from '/@/shared/config';

import {
  setHashValueInHashString,
  setHashValueJsonInUrl,
  stringToBase64String,
  useHashParamBase64,
  useHashParamJson,
} from '@metapages/hash-query';
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
      href = setHashValueJsonInUrl(href, "mfjson", metaframeDef);
    }
    if (modules) {
      href = setHashValueJsonInUrl(href, "modules", modules);
    }
    if (config) {
      href = setHashValueJsonInUrl(href, "c", config);
    }

    const url = new URL(href);

    // I am not sure about this anymore
    url.pathname = "";
    url.host = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[0];
    url.port = (import.meta as any).env.VITE_SERVER_ORIGIN.split(":")[1];

    // WATCH THIS DIFFERENCE BETWEEN THIS AND BELOW
    // 1!
    if (code) {
      url.hash = setHashValueInHashString(
        url.hash,
        "js",
        stringToBase64String(code)
      );
    }
    // Remove the c and v hash params since they are set in the searchParams
    // url.hash = setHashValueInHashString(url.hash, "c", null);
    // url.hash = setHashValueInHashString(url.hash, "v", null);
    setUrl(url.href);
  }, [config, code, metaframeDef, modules, setUrl]);

  return { url };
};
