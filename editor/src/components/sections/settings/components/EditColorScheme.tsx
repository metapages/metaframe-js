import * as yup from 'yup';
import { FormControl, RadioGroup, VStack, Radio, FormLabel, Checkbox, Button, Text } from "@chakra-ui/react";
import { Options, useOptions, Theme } from "/@/hooks/useOptions";
import { useFormik } from "formik";
import { useCallback } from "react";

export const defaultOptions: Options = {
  theme: "light",
};

const OptionDescription: Record<string, string> = {
  theme: "Color Scheme",
};

const validationSchema = yup.object({
  theme: yup
    .string()
    .notRequired()
    .oneOf(["light", "vs-dark", "system"] as Theme[])
    .optional(),
});

interface FormType extends yup.InferType<typeof validationSchema> {}


export const EditColorScheme: React.FC = () => {
  const [options, setOptions] = useOptions();

  const onSubmit = useCallback(
    (values: FormType) => {
      let newOptions: Options | undefined = { ...(values as Options) };
      if (newOptions.theme === defaultOptions.theme) {
        delete newOptions.theme;
      }
      if (Object.keys(newOptions).length === 0) {
        setOptions(undefined);
      } else {
        setOptions(newOptions);
      }
    },
    [setOptions]
  );

  const formik = useFormik({
    initialValues: options || {},
    onSubmit,
    validationSchema,
  });

  return <form onSubmit={formik.handleSubmit}>
  <FormControl pb="1rem">
    <Text fontWeight={700} pb={4}>
      {OptionDescription["theme"]}
    </Text>
    <RadioGroup
      id="theme"
      onChange={(e) => {
        // currently RadioGroup needs this to work
        formik.setFieldValue("theme", e);
        formik.handleSubmit();
      }}
      value={formik.values.theme || defaultOptions.theme}
    >
      <VStack
        spacing={5}
        alignItems={'flex-start'}
      >
        <Radio value="light" colorScheme={"blackAlpha"} defaultChecked><Text>Light</Text></Radio>
        <Radio value="vs-dark" colorScheme={"blackAlpha"}><Text>Dark</Text></Radio>
        <Radio value="system" colorScheme={"blackAlpha"}><Text>System</Text></Radio>
      </VStack>
    </RadioGroup>
  </FormControl>

  {Object.keys(validationSchema.fields as any)
    .filter(
      (fieldName) =>
        (validationSchema.fields as any)[fieldName].type === "boolean"
    )
    .map((fieldName) => (
      <FormControl pb="1rem" key={fieldName}>
        <FormLabel fontWeight="bold" htmlFor={fieldName}>
          {OptionDescription[fieldName]}
        </FormLabel>
        <Checkbox
          name={fieldName}
          size="lg"
          bg="gray.100"
          spacing="1rem"
          onChange={(e) => {
            // currently checkbox needs this to work
            formik.setFieldValue(fieldName, e.target.checked);
            formik.handleSubmit();
          }}
          isChecked={(formik.values as any)[fieldName]}
        />
      </FormControl>
    ))}

  <Button type="submit" display="none">
    submit
  </Button>
</form>
}