import { useCallback } from "react";

import { useOptions } from "/@/hooks/useOptions";

import { Checkbox, FormControl, Text } from "@chakra-ui/react";

export const EditDisableSmartInputUnpacking: React.FC = () => {
  const [options, setOption] = useOptions();

  const onSubmit = useCallback(
    (isChecked: boolean) => {
      setOption(
        "disableSmartInputUnpacking",
        isChecked ? isChecked : undefined,
      );
    },
    [setOption],
  );

  return (
    <>
      <FormControl pb="1rem" p={6}>
        <Text fontWeight={700} pb={2}>
          [Advanced] Disable smart input unpacking (auto-convert JSON binary{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">
            Blobs
          </a>{" "}
          to objects)
        </Text>
        <Checkbox
          name="disableSmartInputUnpacking"
          size="lg"
          bg="gray.100"
          spacing="1rem"
          onChange={(e) => onSubmit(e.target.checked)}
          isChecked={options?.disableSmartInputUnpacking || false}
        />
      </FormControl>
    </>
  );
};
