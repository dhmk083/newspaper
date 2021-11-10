import * as RR from "react-router-dom";
import * as C from "@chakra-ui/react";
import * as F from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "app";
import Auth from "app/auth";

const LoginSchema = yup.object({
  username: yup.string().required().default("").meta({ label: "Username" }),
  password: yup.string().required().default("").meta({ label: "Password" }),
});

function Field({ name, as = C.Input, ...rest }) {
  return (
    <F.Field name={name}>
      {({ meta: { error, touched } }) => (
        <C.FormControl isInvalid={touched && !!error} maxW={400}>
          <C.FormLabel htmlFor={name}>
            {yup.reach(LoginSchema, name).describe().meta.label}
          </C.FormLabel>
          <F.Field id={name} as={as} name={name} {...rest} />
          <C.FormErrorMessage>{touched && error}</C.FormErrorMessage>
        </C.FormControl>
      )}
    </F.Field>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(Auth.isAuthenticated);
  const location = RR.useLocation();

  if (isAuthenticated) return <RR.Navigate to={location.state?.from || "/"} />;

  return (
    <F.Formik
      initialValues={LoginSchema.cast({})}
      validationSchema={LoginSchema}
      onSubmit={(values) => dispatch(Auth.login(values))}
    >
      {({ isSubmitting }) => (
        <F.Form>
          <C.VStack>
            <C.Text fontSize="xl" fontWeight="bold">
              Please, login...
            </C.Text>
            <Field name="username" />
            <Field name="password" type="password" />
            <C.Button type="submit" isLoading={isSubmitting}>
              Login
            </C.Button>
          </C.VStack>
        </F.Form>
      )}
    </F.Formik>
  );
}
