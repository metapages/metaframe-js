import { useCallback } from "react";

import { useOptions } from "/@/hooks/useOptions";

import { Checkbox, FormControl, Text } from "@chakra-ui/react";

export const EditDisableCache: React.FC = () => {
  const [options, setOption] = useOptions();

  const onSubmit = useCallback(
    (isChecked: boolean) => {
      setOption("disableCache", isChecked ? isChecked : undefined);
    },
    [setOption]
  );

  return (
    <>
    <FormControl pb="1rem" p={6}>

      <Text fontWeight={700} pb={2}>
        Disable Resource Caching
      </Text>
      <Text fontSize="sm" color="gray.600" pb={2}>
        Turn off stale-while-revalidate caching for JavaScript, CSS, and other external resources
      </Text>
      <Checkbox
        name="disableCache"
        size="lg"
        bg="gray.100"
        spacing="1rem"
        onChange={(e) => onSubmit(e.target.checked)}
        isChecked={options?.disableCache || false}
        />
        </FormControl>
    </>
  );
};