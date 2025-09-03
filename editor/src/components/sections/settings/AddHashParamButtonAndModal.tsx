import React, { useCallback } from 'react';

import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  Button,
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
} from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';

const validationSchema = yup.object({
  hashParam: yup.string().required('Hash parameter name is required'),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const AddHashParamButtonAndModal: React.FC<{
  add: (input: string) => void;
  text?: string;
}> = ({ add, text }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.hashParam) {
        add(values.hashParam);
      }
      onClose();
    },
    [onClose, add]
  );

  const formik = useFormik({
    initialValues: {
      hashParam: "",
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
        aria-label="add hash parameter"
      >
        {text || "Add Hash Parameter"}
      </Button>

      <Modal isOpen={isOpen} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Add Hash Parameter:</Text>
          </ModalHeader>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Input
                id="hashParam"
                name="hashParam"
                type="text"
                placeholder="Enter hash parameter name"
                onChange={formik.handleChange}
                value={formik.values.hashParam}
              />
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
