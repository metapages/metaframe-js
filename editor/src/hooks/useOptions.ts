import { useHashParamJson } from '@metapages/hash-query';

export type Theme = "light" | "vs-dark" | "system";

export type Options = {
  theme?: Theme | undefined;
};

const HashKeyOptions = "options";

export const useOptions = (defaultOptions?:Options|undefined): [Options, (o: Options) => void] => {
  const [options, setOptions] = useHashParamJson<Options>(HashKeyOptions, defaultOptions);
  return [options, setOptions];
};
