import React, { useContext } from "react";
import useShowAndUpdateNotification from "../../../../global/components/show-and-update-notification";
import { GENDER } from "../../../../lib/enum";
import { useForm } from "@mantine/form";
import { color } from "../../../../lib/colors";
import { IconCheck } from "@tabler/icons-react";
import {
  Avatar,
  Button,
  Container,
  Flex,
  Grid,
  Paper,
  TextInput,
} from "@mantine/core";
import SelectGender from "../../../../global/components/gender-select";
import SingleImageUpload from "../../../../global/components/single-image-upload";
import { DateInput, DateValue } from "@mantine/dates";
import AuthContext from "../../../../context/auth-context";
import DotLoader from "../../../../global/components/dot-loader";
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRefe, uploadString, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, push } from "firebase/database"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMlJX_KBAwnUXyBo-UY88ajSMVrHxTUyI",
  authDomain: "armenu-73998.firebaseapp.com",
  databaseURL: "https://armenu-73998-default-rtdb.firebaseio.com",
  projectId: "armenu-73998",
  storageBucket: "armenu-73998.appspot.com",
  messagingSenderId: "93842579323",
  appId: "1:93842579323:web:2f05c981a858920d9fe7de",
  measurementId: "G-CPKKWB0H7C"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

type StaffRegistrationFormProps = {
  closeStaffRegModalForm: () => void;
};

const StaffRegistrationForm: React.FC<StaffRegistrationFormProps> = ({
  closeStaffRegModalForm,
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not defined");
  }

  const { loading, setLoading } = authContext;
  const { showNotification } = useShowAndUpdateNotification();

  const form = useForm<{
    firstname: string;
    lastname: string;
    email: string;
    mobile: string;
    gender: GENDER | null;
    username: string;
    birthDate: Date | null;
    passport: File | null;
  }>({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      mobile: "",
      gender: null,
      username: "",
      birthDate: null,
      passport: null,
    },
    validate: {
      firstname: (val) => (val.length > 0 ? null : "First name is required"),
      lastname: (val) => (val.length > 0 ? null : "Last name is required"),
      email: (val) =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val)
          ? null
          : "Invalid email",
      mobile: (val) =>
        /^(\+?255|0)\d{9}$/.test(val)
          ? null
          : "Invalid Tanzanian mobile number",
      gender: (val) => (val !== null ? null : "Please select a gender"),
      username: (val) =>
        /^[a-zA-Z0-9_]+$/.test(val) ? null : "Invalid username format",
      birthDate: (val) =>
        val !== null ? null : "Please select your birthdate",
      passport: (val) => (val !== null ? null : "Please upload your passport"),
    },
  });

  const handleOnSubmit = () => {
    setLoading(true);

    const file = form.values.passport;

    if (!file) {
        setLoading(false);
        console.error('No image selected');
        return;
    }

    const imageName = file.name;

    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
          const passport = event.target.result as string;

          // Upload image data URL to Firebase Storage
          const storageRef = storageRefe(storage, 'menu_images/' + imageName);
          uploadString(storageRef, passport, 'data_url')
              .then(() => {
                  // Get the download URL of the uploaded image
                  getDownloadURL(storageRef)
                      .then((url) => {
                          const newData = {
                              firstname: form.values.firstname,
                              lastname: form.values.lastname,
                              email: form.values.email,
                              mobile: form.values.mobile,
                              gender: form.values.gender,
                              username: form.values.username,
                              birthDate: form.values.birthDate,
                              passport: url,
                              password: "cafeteria"
                          };

                  
                          
                          push(ref(database, 'Staff Members'), newData)
                              .then(() => {
                                  setLoading(false);
                                  showNotification({
                                      id: 'add',
                                      message: 'Successfully added',
                                      color: color.green,
                                      title: 'New user',
                                      icon: <IconCheck size="1rem" />,
                                  });
                                  closeNewMenuModalForm();
                              })
                              .catch((error) => {
                                  console.error('Error adding new menu: ', error);
                              });
                      })
                      .catch((error) => {
                          console.error('Error getting download URL: ', error);
                      });
              })
              .catch((error) => {
                  console.error('Error uploading image: ', error);
              });
      } else {
          setLoading(false);
          console.error('Failed to load image');
      }
  };

  reader.readAsDataURL(file);

    // setTimeout(() => {
    //   setLoading(false);
    //   showNotification({
    //     id: "register",
    //     message: "Successfully registered",
    //     color: color.green,
    //     title: "Staff Registration",
    //     icon: <IconCheck size="1rem" />,
    //   });
    //   closeStaffRegModalForm();
    // }, 3000);
  };

  return (
    <Paper p={"md"} radius={"md"} w={"100%"}>
      {loading && <DotLoader />}
      <form onSubmit={form.onSubmit(handleOnSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              type="text"
              label=""
              value={form.values.firstname}
              placeholder="First Name"
              onChange={(event) =>
                form.setFieldValue("firstname", event.currentTarget.value)
              }
              error={form.errors.firstname}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              type="text"
              label=""
              value={form.values.lastname}
              placeholder="Last Name"
              onChange={(event) =>
                form.setFieldValue("lastname", event.currentTarget.value)
              }
              error={form.errors.lastname}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              type="email"
              label=""
              value={form.values.email}
              placeholder="Email"
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              type="tel"
              label=""
              value={form.values.mobile}
              placeholder="mobile"
              onChange={(event) =>
                form.setFieldValue("mobile", event.currentTarget.value)
              }
              error={form.errors.mobile}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectGender
              variant="default"
              label=""
              value={form.values.gender}
              placeholder="Select Gender"
              onChange={(value) => form.setFieldValue("gender", value)}
              error={form.errors.gender}
            />
          </Grid.Col>

          {/* <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectRole
              placeholder="Role"
              error={form.errors.role}
              variant="default"
              label=""
              value={form.values.role}
              onChange={(value) => form.setFieldValue("role", value)}
            />
          </Grid.Col> */}

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              type="text"
              label=""
              value={form.values.username}
              placeholder="username"
              onChange={(event) =>
                form.setFieldValue("username", event.currentTarget.value)
              }
              error={form.errors.username}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              value={form.values.birthDate}
              label=""
              placeholder="DD MMM YYYY"
              valueFormat="DD MMM YYYY"
              // maxDate={dayjs(new Date()).subtract(17, "years").toDate()}
              clearable
              onChange={(dateValue: DateValue) =>
                form.setFieldValue("birthDate", dateValue)
              }
              error={form.errors.birthDate}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12 }}>
            <Flex direction={"row"} align={"center"} justify={"center"}>
              <Container w={"80%"} p={0}>
                <SingleImageUpload
                  description=""
                  error={form.errors.passport}
                  value={form.values.passport}
                  label=""
                  onChange={(file: File | null) => {
                    if (file) {
                      form.setFieldValue("passport", file);
                    } else {
                      form.setFieldValue("passport", null);
                    }
                  }}
                  placeholder="Choose passport"
                  key={form.values.passport ? "" : form.values.passport}
                />
              </Container>
              <Flex w={"20%"} align={"center"} justify={"center"}>
                <Avatar
                  src={
                    form.values.passport !== null
                      ? URL.createObjectURL(form.values.passport)
                      : null
                  }
                  w={60}
                  h={60}
                  radius={"sm"}
                />
              </Flex>
            </Flex>
          </Grid.Col>
        </Grid>

        <Flex justify="center" direction={"row"} gap={"md"}>
          <Button
            type="button"
            fullWidth
            bg={`${color.red}`}
            mt="xl"
            onClick={closeStaffRegModalForm}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth mt="xl">
            Submit
          </Button>
        </Flex>
      </form>
    </Paper>
  );
};

export default StaffRegistrationForm;
function closeNewMenuModalForm() {
  throw new Error("Function not implemented.");
}

