import React, { useCallback } from "react";

import { useFormik } from "formik";
import * as yup from "yup";

import {
  Button,
  HStack,
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
} from "@chakra-ui/react";
import { Plus } from "@phosphor-icons/react";

const validationSchema = yup.object({
  fileName: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const AddInputButtonAndModal: React.FC<{
  add: (input: string) => void;
  text?: string;
}> = ({ add, text }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.fileName) {
        add(values.fileName);
      }
      onClose();
    },
    [onClose, add],
  );

  const formik = useFormik({
    initialValues: {
      fileName: "",
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
      <HStack onClick={onToggle} aria-label="add input">
        <Icon boxSize={6} as={Plus} />
        {text ? <Text size={"med"}>{text}</Text> : null}
      </HStack>
      <Modal isOpen={isOpen} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Add module:</Text>
          </ModalHeader>
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Input
                id="fileName"
                name="fileName"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.fileName}
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
