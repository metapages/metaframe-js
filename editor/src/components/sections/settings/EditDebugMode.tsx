import { useCallback } from "react";

import { useOptions } from "/@/hooks/useOptions";

import { Checkbox, FormControl, Text } from "@chakra-ui/react";

export const EditDebugMode: React.FC = () => {
  const [options, setOption] = useOptions();

  const onSubmit = useCallback(
    (isChecked: boolean) => {
      setOption("debug", isChecked ? isChecked : undefined);
    },
    [setOption]
  );

  return (
    <>
    <FormControl pb="1rem" p={6}>

      <Text fontWeight={700} pb={2}>
        [Debug] Enable Cache Logging
      </Text>
      <Text fontSize="sm" color="gray.600" pb={2}>
        Show detailed cache hit/miss logs in browser console for debugging
      </Text>
      <Checkbox
        name="debug"
        size="lg"
        bg="gray.100"
        spacing="1rem"
        onChange={(e) => onSubmit(e.target.checked)}
        isChecked={options?.debug || false}
        />
        </FormControl>
    </>
  );
};