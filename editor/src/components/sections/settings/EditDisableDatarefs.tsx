import { useCallback } from "react";

import { useOptions } from "/@/hooks/useOptions";

import { Checkbox, FormControl, Text } from "@chakra-ui/react";

export const EditDisableDatarefs: React.FC = () => {
  const [options, setOption] = useOptions();

  const onSubmit = useCallback(
    (isChecked: boolean) => {
      setOption("disableDatarefs", isChecked ? isChecked : undefined);
    },
    [setOption]
  );

  return (
    <>
    <FormControl pb="1rem" p={6}>

      <Text fontWeight={700} pb={2}>
        [Advanced] Disable input dataref conversion (send Blob/Files as URLs)
      </Text>
      <Checkbox
        name="disableDatarefs"
        size="lg"
        bg="gray.100"
        spacing="1rem"
        onChange={(e) => onSubmit(e.target.checked)}
        isChecked={options?.disableDatarefs || false}
        />
        </FormControl>
    </>
  );
};
