import React, { useCallback } from 'react';

import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Plus, PencilSimple } from '@phosphor-icons/react';
import { HashParamDefinition, HashParamType } from '@metapages/metapage';

export type HashParamMetadata = HashParamDefinition;

const validationSchema = yup.object({
  name: yup.string().required('Hash parameter name is required'),
  type: yup.string().required('Type is required'),
  description: yup.string().optional(),
  label: yup.string().optional(),
  allowedValues: yup.string().optional(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const AddHashParamButtonAndModal: React.FC<{
  add: (name: string, metadata: HashParamMetadata) => void;
  edit?: (oldName: string, name: string, metadata: HashParamMetadata) => void;
  text?: string;
  editingHashParam?: { name: string; metadata: HashParamMetadata } | null;
  onCloseEdit?: () => void;
}> = ({ add, edit, text, editingHashParam, onCloseEdit }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isEditing = !!editingHashParam;

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.name && values.type) {
        const allowedValues = values.allowedValues
          ? values.allowedValues.split(',').map(v => v.trim()).filter(v => v.length > 0)
          : undefined;
        
        const metadata: HashParamDefinition = {
          type: values.type as HashParamType,
          ...(values.description && values.description.trim() ? { description: values.description } : {}),
          ...(values.label && values.label.trim() ? { label: values.label } : {}),
          ...(allowedValues && allowedValues.length > 0 ? { allowedValues } : {}),
        };

        if (isEditing && editingHashParam && edit) {
          edit(editingHashParam.name, values.name, metadata);
        } else {
          add(values.name, metadata);
        }
      }
      onClose();
      if (onCloseEdit) {
        onCloseEdit();
      }
    },
    [onClose, add, edit, isEditing, editingHashParam, onCloseEdit]
  );

  const formik = useFormik({
    initialValues: {
      name: editingHashParam?.name || "",
      type: editingHashParam?.metadata.type || "",
      description: editingHashParam?.metadata.description || "",
      label: editingHashParam?.metadata.label || "",
      allowedValues: editingHashParam?.metadata.allowedValues?.join(', ') || "",
    },
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });

  const closeAndClear = useCallback(() => {
    formik.resetForm();
    onClose();
    if (onCloseEdit) {
      onCloseEdit();
    }
  }, [formik, onClose, onCloseEdit]);

  return (
    <>
      {!isEditing && (
        <Button
          variant="ghost"
          leftIcon={<Icon as={Plus} boxSize={6} />}
          onClick={onToggle}
          aria-label="add hash parameter"
        >
          {text || "Add Hash Parameter"}
        </Button>
      )}

      <Modal isOpen={isOpen || isEditing} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>{isEditing ? "Edit" : "Add"} Hash Parameter:</Text>
          </ModalHeader>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter hash parameter name"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="type">Type</FormLabel>
                  <Select
                    id="type"
                    name="type"
                    onChange={formik.handleChange}
                    value={formik.values.type}
                    placeholder="Select a type"
                  >
                    <option value="string">string</option>
                    <option value="json">json</option>
                    <option value="boolean">boolean</option>
                    <option value="stringBase64">stringBase64</option>
                    <option value="number">number</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="label">Label (optional)</FormLabel>
                  <Input
                    id="label"
                    name="label"
                    type="text"
                    placeholder="Display label for the parameter"
                    onChange={formik.handleChange}
                    value={formik.values.label}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="description">Description (optional)</FormLabel>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description of what this parameter does"
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="allowedValues">Allowed Values (optional)</FormLabel>
                  <Input
                    id="allowedValues"
                    name="allowedValues"
                    type="text"
                    placeholder="Comma-separated list, e.g., disabled, invisible, visible"
                    onChange={formik.handleChange}
                    value={formik.values.allowedValues}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Enter comma-separated values if this parameter has a restricted set of allowed values
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blackAlpha" mr={3}>
                {isEditing ? "Save" : "Add"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
