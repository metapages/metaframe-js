import { useCallback } from 'react';

import {
  Center,
  HStack,
  Table,
  Tbody,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useHashParamJson } from '@metapages/hash-query/react-hooks';
import { AddModuleButtonAndModal } from './AddModuleButtonAndModal';
import { ModuleRow } from './ModuleRow';

export const SectionModules: React.FC = () => {
  const [modules, setModules] = useHashParamJson<string[] | undefined>("modules");

  const addNewInput = useCallback(
    (name: string) => {
      setModules(modules ? [...modules, name] : [name]);
      if (name.startsWith("{")) {
        // import maps require a reload to take effect
        setTimeout(() => {
          window.parent?.location.reload();
        }, 1000);
      }
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
        <AddModuleButtonAndModal add={addNewInput} />
      </HStack>
      <VStack gap={4}>
        <Table px={5} variant="simple">
          <Tbody>
            {(modules || []).map((module, i) => (
              <ModuleRow
                key={module}
                name={module}
                content={module}
                onDelete={() => deleteInput(i)}
              />
            ))}
          </Tbody>
        </Table>
        <Center>
          <AddModuleButtonAndModal add={addNewInput} text={'Add Module'} />
        </Center>
      </VStack>
    </VStack>
  );
};