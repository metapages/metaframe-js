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
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';

const validationSchema = yup.object({
  name: yup.string().required('Input name is required'),
  url: yup.string().required('URL is required'),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const AddInputButtonAndModal: React.FC<{
  add: (name: string, url: string) => void;
  text?: string;
}> = ({ add, text }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.name && values.url) {
        add(values.name, values.url);
      }
      onClose();
    },
    [onClose, add]
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      url: "",
    },
    onSubmit,
    validationSchema,
  });

  const closeAndClear = useCallback(() => {
    formik.resetForm();
    onClose();
  }, [formik, onClose]);

  return (
    <>
      <Button
        variant="ghost"
        leftIcon={<Icon as={Plus} boxSize={6} />}
        onClick={onToggle}
        aria-label="add input"
      >
        {text || "Add Input"}
      </Button>

      <Modal isOpen={isOpen} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Add Initial Input:</Text>
          </ModalHeader>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel htmlFor="name">Input Name</FormLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., data, config"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="url">URL</FormLabel>
                  <Input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="https://example.com/data.json"
                    onChange={formik.handleChange}
                    value={formik.values.url}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blackAlpha" mr={3}>
                Add
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
