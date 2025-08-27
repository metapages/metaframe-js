import { useHashParamJson } from "@metapages/hash-query/react-hooks";
import { useCallback } from "react";

export type Theme = "light" | "vs-dark" | "system";

export type Options = {
  theme?: Theme | undefined;
  disableDatarefs?: boolean | undefined;
};

const HashKeyOptions = "options";

type SetOption = (key: keyof Options, value: Options[keyof Options]) => void;

export const useOptions = (): [Options, SetOption, (o: Options) => void] => {
  const [options, setOptions] = useHashParamJson<Options>(HashKeyOptions);
  const setOption = useCallback((key: keyof Options, value: Options[keyof Options]) => {
    const newOptions = { ...options, [key]: value };
    if (value === undefined) {
      delete newOptions[key];
    }
    setOptions(newOptions);
  }, [options, setOptions]);
  return [options, setOption, setOptions ];
};
