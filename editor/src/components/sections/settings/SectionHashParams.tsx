import { useCallback } from "react";

import { Center, HStack, Text, VStack } from "@chakra-ui/react";
import { useHashParamJson } from "@metapages/hash-query/react-hooks";
import {
  isEmptyMetaframeDefinition,
  MetaframeDefinitionV2,
} from "@metapages/metapage";
import { HashParamRow } from "./HashParamRow";
import { AddHashParamButtonAndModal } from "./AddHashParamButtonAndModal";

export const SectionHashParams: React.FC = () => {
  const [definition, setDefinition] = useHashParamJson<
    MetaframeDefinitionV2 | undefined
  >("definition");

  const addNewHashParam = useCallback(
    (name: string) => {
      const newDefinition: MetaframeDefinitionV2 = { ...definition };
      if (!newDefinition.hashParams) {
        newDefinition.hashParams = [];
      }
      newDefinition.hashParams.push(name);
      newDefinition.version = "1";
      setDefinition(newDefinition);
    },
    [definition, setDefinition]
  );

  const deleteHashParam = useCallback(
    (index: number) => {
      const newDefinition = { ...definition };
      if (newDefinition.hashParams) {
        newDefinition.hashParams.splice(index, 1);
        newDefinition.version = "1";

        if (isEmptyMetaframeDefinition(newDefinition)) {
          setDefinition(undefined);
        } else {
          setDefinition(newDefinition);
        }
      }
    },
    [definition, setDefinition]
  );

  return (
    <VStack width="100%" pt={5} gap={4}>
      <HStack
        alignItems="flex-start"
        px={5}
        width="100%"
        justifyContent="space-between"
      >
        <VStack alignItems={"flex-start"}>
          <Text fontWeight={600}>Allowed Hash Parameters</Text>
          <Text>
            Define which hash parameters are allowed in the metaframe URL
          </Text>
        </VStack>
      </HStack>
      <VStack gap={4} alignItems="flex-start" width="100%">
        <VStack gap={0} alignItems="flex-start" width="100%">
          {(definition?.hashParams || []).map((hashParam, i) => (
            <VStack key={hashParam} width="100%" gap={0}>
              <HStack px={5} width="100%" justify="space-between" py={2}>
                <HashParamRow
                  name={hashParam}
                  onDelete={() => deleteHashParam(i)}
                />
              </HStack>
              {i < (definition?.hashParams?.length || 0) - 1 && (
                <HStack width="100%" px={5}>
                  <Text
                    borderBottom="1px solid"
                    borderColor="#E8E8E8"
                    width="100%"
                  />
                </HStack>
              )}
            </VStack>
          ))}
        </VStack>
        <Center width="100%">
          <AddHashParamButtonAndModal
            add={addNewHashParam}
            text={"Add Hash Parameter"}
          />
        </Center>
      </VStack>
    </VStack>
  );
};
