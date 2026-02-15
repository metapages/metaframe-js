import { useCallback } from "react";

import { Radio, RadioGroup, Text, VStack } from "@chakra-ui/react";
import { useHashParam } from "@metapages/hash-query/react-hooks";

export type Modes = "visible" | "invisible" | "disabled";
export const DefaultMode: Modes = "invisible";

export const EditButtonSettings: React.FC = () => {
  const [mode, setMode] = useHashParam("hm", undefined);

  const handleRadio = useCallback(
    (nextValue: string) => {
      setMode(nextValue === DefaultMode ? undefined : nextValue);
    },
    [mode, setMode],
  );

  return (
    <VStack align="flex-start" w="100%" minW={"100%"} p={6}>
      <Text fontWeight={700}>Button Visibility</Text>
      <RadioGroup
        id="mode"
        onChange={handleRadio}
        value={mode || DefaultMode}
        w="100%"
      >
        <VStack alignItems={"flex-start"} w={"100%"} spacing={3}>
          <Radio colorScheme={"blackAlpha"} value="visible">
            <Text>Always Visible</Text>
          </Radio>
          <Radio colorScheme={"blackAlpha"} value="invisible" defaultChecked>
            <Text>Visible on Hover</Text>
          </Radio>
          <Radio colorScheme={"blackAlpha"} value="disabled">
            <Text>Hidden</Text>
          </Radio>
        </VStack>
      </RadioGroup>
    </VStack>
  );
};
