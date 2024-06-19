import React, { useContext } from "react";
import { useForm } from "@mantine/form";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Title,
  Flex,
  Center,
} from "@mantine/core";
import { IconCheck, IconPasswordUser, IconUser } from "@tabler/icons-react";
import { color } from "../../lib/colors";
import AuthContext from "../../context/auth-context";
import DotLoader from "../../global/components/dot-loader";
import useShowAndUpdateNotification from "../../global/components/show-and-update-notification";
import useCustomNavigation from "../../global/function/navigation";

const Authentication: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not defined");
  }

  const { loginUnser, loading, setLoading } = authContext;

  const { showNotification } = useShowAndUpdateNotification();
  const { navigateAdminPanel } = useCustomNavigation();

  //FORMS
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      check: false,
    },
    validate: {
      email: (val) =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val)
          ? null
          : "Invalid email",
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleOnSubmit = () => {
    form.reset();

    if (form.values.email === 'staff@gmail.com' && form.values.password === '1234567') {
      const success = loginUnser({
        email: form.values.email,
        password: form.values.password,
      });
  
      if (success !== null) {
        setTimeout(() => {
          showNotification({
            id: "login",
            message: success,
            title: "Authentication",
            color: color.green,
            icon: <IconCheck />,
          });
          setLoading(false);
          navigateAdminPanel();
        }, 1000);
      }
    } else {
      // Notify the user that the email or password is incorrect
      showNotification({
        id: "login",
        message: "Incorrect email or password.",
        title: "Authentication",
        color: color.red,
        icon: <IconCheck />,
      });
    }
  };

  return (
    <Container
      fluid
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && <DotLoader />}
      <Flex direction={"column"} justify={"center"} align={"center"} gap={"md"}>
        <Title
          order={2}
          c={`${color.blue_950}`}
          style={{
            whiteSpace: "pre-line",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          AR Restaurant Menu
        </Title>

        <form onSubmit={form.onSubmit(handleOnSubmit)}>
          <Paper withBorder shadow="md" p={30} radius="md">
            <Center>
              <Title order={3} c={`${color.blue_950}`}>
               Manager Login Page
              </Title>
            </Center>
            <Center>
              <Text c={`${color.blue_950}`}>
                {/* Enter your username & password to login */}
              </Text>
            </Center>
            <TextInput
              c={`${color.blue_500}`}
              type="email"
              label="Email"
              value={form.values.email}
              placeholder="you@gmail.com"
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email}
              leftSection={<IconUser />}
              mt={"md"}
            />

            <PasswordInput
              c={`${color.blue_500}`}
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={form.errors.password}
              leftSection={<IconPasswordUser />}
              mt="md"
            />

            <Button bg={`${color.blue_500}`} type="submit" fullWidth mt="xl" variant="filled">
              Sign in
            </Button>
          </Paper>
        </form>
      </Flex>
    </Container>
  );
};

export default Authentication;
