import { useCallback } from 'react';

import {
  Center,
  HStack,
  Table,
  Tbody,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useHashParamJson } from '@metapages/hash-query';
import { AddInputButtonAndModal } from './AddInputButtonAndModal';
import { InputRow } from './InputRow';

export const SectionModules: React.FC = () => {
  const [modules, setModules] = useHashParamJson<string[]>("modules");

  const addNewInput = useCallback(
    (name: string) => {
      modules.push(name);
      setModules(modules);
    },
    [modules, setModules]
  );

  const deleteInput = useCallback(
    (index: number) => {
      modules.splice(index, 1)
      setModules(modules);
    },
    [modules, setModules]
  );

  return (
    <VStack width="100%" pt={5} gap={4}>
      <HStack alignItems="flex-start" px={5} width="100%" justifyContent="space-between">
        <VStack alignItems={'flex-start'}>
          <Text fontWeight={600}>Modules</Text>
          <Text>JS and CSS URLs — Added to index.html</Text>
        </VStack>
        <AddInputButtonAndModal add={addNewInput} />
      </HStack>
      <VStack gap={4}>
        <Table px={5} variant="simple">
          <Tbody>
            {(modules || []).map((module, i) => (
              <InputRow
                key={module}
                name={module}
                content={module}
                onDelete={() => deleteInput(i)}
              />
            ))}
          </Tbody>
        </Table>
        <Center>
          <AddInputButtonAndModal add={addNewInput} text={'Add Module'} />
        </Center>
      </VStack>
    </VStack>
  );
};