export const isSearchParamTruthy = (param: string | null | undefined) => {
  return !!(param && param !== "0" && param.toLowerCase() !== "false");
};
