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
import {useIsReadOnly} from "/@/hooks/isReadOnly";

const validationSchema = yup.object({
  modulePath: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const AddModuleButtonAndModal: React.FC<{
  add: (input: string) => void;
  text?: string;
}> = ({ add, text }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isReadOnly = useIsReadOnly();
  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.modulePath) {
        add(values.modulePath);
      }
      onClose();
    },
    [onClose, add]
  );

  const formik = useFormik({
    initialValues: {
      modulePath: "",
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
        aria-label="add module"
        disabled={isReadOnly}
      >
        {text}
      </Button>

      <Modal isOpen={isOpen} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Add module:</Text>
          </ModalHeader>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Input
                id="modulePath"
                name="modulePath"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.modulePath}
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
