import { useCallback } from 'react';

import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useHashParam } from '@metapages/hash-query/react-hooks';

const validationSchema = yup.object({
  editorWidth: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const EditEditorWidth: React.FC = () => {
  const [editorWidth, setEditorWidth] = useHashParam("editorWidth", "80ch");

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.editorWidth) {
        setEditorWidth(values.editorWidth);
      }
    },
    [setEditorWidth]
  );

  const formik = useFormik({
    initialValues: {
      editorWidth: editorWidth || "",
    },
    onSubmit,
    validationSchema,
  });

  return (
    <VStack align="flex-start" w="100%" minW={"100%"} p={6}>
      <Text fontWeight={700}>Editor Width (e.g. 80ch, 50%. Default unit is 'ch')</Text>
      <form onSubmit={formik.handleSubmit}>
        <Input
          id="editorWidth"
          name="editorWidth"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.editorWidth}
        />
      </form>
    </VStack>
  );
};
