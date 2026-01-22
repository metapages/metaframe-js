import { useCallback, useState } from "react";

import { Center, HStack, Text, VStack } from "@chakra-ui/react";
import { useHashParamJson } from "@metapages/hash-query/react-hooks";
import {
  isEmptyMetaframeDefinition,
  MetaframeDefinitionV2,
  HashParamDefinition,
} from "@metapages/metapage";
import { HashParamRow } from "./HashParamRow";
import { AddHashParamButtonAndModal, HashParamMetadata } from "./AddHashParamButtonAndModal";

export const SectionHashParams: React.FC = () => {
  const [definition, setDefinition] = useHashParamJson<
    MetaframeDefinitionV2 | undefined
  >("definition");
  const [editingHashParam, setEditingHashParam] = useState<{
    name: string;
    metadata: HashParamMetadata;
  } | null>(null);

  const addNewHashParam = useCallback(
    (name: string, metadata: HashParamMetadata) => {
      const newDefinition: MetaframeDefinitionV2 = { ...definition };
      if (!newDefinition.hashParams) {
        newDefinition.hashParams = {};
      }
      // Convert array format to object format if needed (backward compatibility)
      if (Array.isArray(newDefinition.hashParams)) {
        const oldArray = newDefinition.hashParams;
        newDefinition.hashParams = {};
        oldArray.forEach((paramName) => {
          newDefinition.hashParams[paramName] = {
            type: "string" as const,
            description: "",
            label: paramName,
          };
        });
      }
      newDefinition.hashParams[name] = metadata as HashParamDefinition;
      newDefinition.version = "1";
      setDefinition(newDefinition);
    },
    [definition, setDefinition]
  );

  const editHashParam = useCallback(
    (oldName: string, name: string, metadata: HashParamMetadata) => {
      const newDefinition = { ...definition };
      if (newDefinition.hashParams) {
        // Convert array format to object format if needed (backward compatibility)
        if (Array.isArray(newDefinition.hashParams)) {
          const oldArray = newDefinition.hashParams;
          newDefinition.hashParams = {};
          oldArray.forEach((paramName) => {
            newDefinition.hashParams[paramName] = {
              type: "string" as const,
              description: "",
              label: paramName,
            };
          });
        }
        
        // If the name changed, delete the old entry
        if (oldName !== name) {
          delete newDefinition.hashParams[oldName];
        }
        newDefinition.hashParams[name] = metadata as HashParamDefinition;
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

  const deleteHashParam = useCallback(
    (name: string) => {
      const newDefinition = { ...definition };
      if (newDefinition.hashParams) {
        // Handle both array and object formats for backward compatibility
        if (Array.isArray(newDefinition.hashParams)) {
          const index = newDefinition.hashParams.indexOf(name);
          if (index !== -1) {
            newDefinition.hashParams.splice(index, 1);
          }
        } else {
          delete newDefinition.hashParams[name];
        }
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

  // Convert hashParams to object format for rendering
  const hashParamsObject = (() => {
    if (!definition?.hashParams) {
      return {};
    }
    if (Array.isArray(definition.hashParams)) {
      // Convert old array format to object format
      const obj: Record<string, HashParamDefinition> = {};
      definition.hashParams.forEach((paramName) => {
        obj[paramName] = {
          type: "string" as const,
          description: "",
          label: paramName,
        };
      });
      return obj;
    }
    return definition.hashParams as Record<string, HashParamDefinition>;
  })();

  const hashParamEntries = Object.entries(hashParamsObject);
  const hashParamNames = hashParamEntries.map(([name]) => name);

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
          {hashParamEntries.map(([name, metadata], i) => (
            <VStack key={name} width="100%" gap={0}>
              <HStack px={5} width="100%" justify="space-between" py={2}>
                <HashParamRow
                  name={name}
                  metadata={metadata}
                  onDelete={() => deleteHashParam(name)}
                  onEdit={() => setEditingHashParam({ name, metadata })}
                />
              </HStack>
              {i < hashParamEntries.length - 1 && (
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
            edit={editHashParam}
            text={"Add Hash Parameter"}
            editingHashParam={editingHashParam}
            onCloseEdit={() => setEditingHashParam(null)}
          />
        </Center>
      </VStack>
    </VStack>
  );
};
