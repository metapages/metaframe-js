import { useCallback } from 'react';
import { useFormik } from "formik";
import * as yup from "yup";

import {
  VStack,
  Text,
  Input,
} from '@chakra-ui/react';
import { useHashParam } from '@metapages/hash-query';

const validationSchema = yup.object({
  color: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}


export const EditBgColor: React.FC = () => {
  const [bgColor, setbgColor] = useHashParam("bgColor", undefined);

  // const handleChange = useCallback(
  //   (nextValue: string) => {
  //     setbgColor(nextValue);
  //   },
  //   [bgColor, setbgColor]
  // );
  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.color) {
        setbgColor(values.color);
      }
    },
    [setbgColor],
  );

  const formik = useFormik({
    initialValues: {
      color: bgColor || '',
    },
    onSubmit,
    validationSchema,
  });


  return (
    <VStack align="flex-start" w="100%" minW={'100%'}>
      <Text fontWeight={700} pb={4}>Default Background Color</Text>
      <form onSubmit={formik.handleSubmit}>
        <Input
          id="color"
          name="color"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.color}
        />
      </form>
    </VStack>
  );
};
