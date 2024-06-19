import { useForm } from "@mantine/form";
import React, { useContext } from "react";
import useShowAndUpdateNotification from "../../../../global/components/show-and-update-notification";
import { IconCheck } from "@tabler/icons-react";
import { color } from "../../../../lib/colors";
import { CATEGORY, MEALTYPE, STATUS } from "../../../../lib/enum";
import {
  Avatar,
  Button,
  Container,
  Flex,
  Grid,
  Paper,
  TextInput,
} from "@mantine/core";
import SelectDayRoutine from "../../../../global/components/day-routine-select";
import SelectCategory from "../../../../global/components/category-select";
import SingleImageUpload from "../../../../global/components/single-image-upload";
import AuthContext from "../../../../context/auth-context";
import DotLoader from "../../../../global/components/dot-loader";
import SelectMealType from "../../../../global/components/mealtypeselect";
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRefe, uploadString, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, push, DatabaseReference } from "firebase/database"; 

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

type CustomerRegistrationProps = {
  closeNewMenuModalForm: () => void;
};

const NewMenu: React.FC<CustomerRegistrationProps> = ({
  closeNewMenuModalForm,
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not defined");
  }

  const { loading, setLoading } = authContext;
  const { showNotification } = useShowAndUpdateNotification();

  const form = useForm<{
    foodName: string;
    mealType: MEALTYPE | null;
    categoryType: CATEGORY | null;
    price: string;
    statusMode: STATUS | null;
    menuImage: File | null;
  }>({
    initialValues: {
      foodName: "",
      mealType: null,
      categoryType:null,
      price: "",
      statusMode: null,
      menuImage: null,
    },
    validate: {
      foodName: (val) => (val.length > 2 ? null : "Name is too short"),

      mealType: (val) => (val === null ? "Please select a mealType" : null),
      categoryType: (val) => (val === null ? "Please select a category" : null),
      price: (val) => (val.length === 0 ? "Food price required" : null),
      statusMode: (val) =>
        val === null ? "Select food status" : null,

      menuImage: (val) => (!val ? "Please upload food image" : null),
    },
  });

 
  const handleOnSubmit = () => {
    setLoading(true);

    const file = form.values.menuImage;

    if (!file) {
        setLoading(false);
        console.error('No image selected');
        return;
    }

    const imageName = file.name;

    const reader = new FileReader();

    reader.onload = (event) => {
        if (event.target && event.target.result) {
            const imageDataUrl = event.target.result as string;

            // Upload image data URL to Firebase Storage
            const storageRef = storageRefe(storage, 'menu_images/' + imageName);
            uploadString(storageRef, imageDataUrl, 'data_url')
                .then(() => {
                    // Get the download URL of the uploaded image
                    getDownloadURL(storageRef)
                        .then((url) => {
                            const newData = {
                                foodName: form.values.foodName,
                                mealType: form.values.mealType,
                                categoryType: form.values.categoryType,
                                price: form.values.price,
                                statusMode: form.values.statusMode,
                                menuImage: url, // Store the URL of the uploaded image
                            };

                            // Push the new data to the appropriate subcollection in the database
                            let subcollectionRef: DatabaseReference | null = null;

                            const mealType = form.values.mealType;
                            if (mealType !== null) {
                                if (mealType === MEALTYPE.BREAKFAST) {
                                    subcollectionRef = ref(database, 'MENUS/Breakfast');
                                } else if (mealType === MEALTYPE.LUNCH) {
                                    subcollectionRef = ref(database, 'MENUS/Lunch');
                                } else if (mealType === MEALTYPE.DINNER) {
                                    subcollectionRef = ref(database, 'MENUS/Dinner');
                                }
                            }
                            
                            if (subcollectionRef) {
                                push(subcollectionRef, newData)
                                    .then(() => {
                                        setLoading(false);
                                        showNotification({
                                            id: 'add',
                                            message: 'Successfully added',
                                            color: color.green,
                                            title: 'Menu',
                                            icon: <IconCheck size="1rem" />,
                                        });
                                        closeNewMenuModalForm();
                                    })
                                    .catch((error) => {
                                        console.error('Error adding new menu: ', error);
                                    });
                            } else {
                                console.error('Invalid food category');
                            }
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
};

  
  return (
    <Paper p={"md"} radius={"md"} w={"100%"}>
      {loading && <DotLoader />}
      <form onSubmit={form.onSubmit(handleOnSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12 }}>
            <TextInput
              type="text"
              label="Food Name"
              value={form.values.foodName}
              placeholder="name"
              onChange={(event) =>
                form.setFieldValue("foodName", event.currentTarget.value)
              }
              error={form.errors.foodName}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectDayRoutine
              placeholder="Status Mode"
              error={form.errors.statusMode}
              variant="default"
              label="Status Mode"
              value={form.values.statusMode}
              onChange={(value) => form.setFieldValue("statusMode", value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectMealType
              placeholder="Meal Type"
              error={form.errors.mealType}
              variant="default"
              label="Meal Type"
              value={form.values.mealType}
              onChange={(value) => form.setFieldValue("mealType", value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <SelectCategory
              placeholder="Food category"
              error={form.errors.categoryType}
              variant="default"
              label="Food Category"
              value={form.values.categoryType}
              onChange={(value) => form.setFieldValue("categoryType", value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12 , md: 6}}>
            <TextInput
              type="number"
              label="Price"
              value={form.values.price}
              placeholder="name"
              onChange={(event) =>
                form.setFieldValue("price", event.currentTarget.value)
              }
              error={form.errors.price}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12 }}>
            <Flex direction={"row"} align={"center"} justify={"center"}>
              <Container w={"80%"} p={0}>
                <SingleImageUpload
                  description=""
                  error={form.errors.menuImage}
                  value={form.values.menuImage}
                  label="Upload Menu Image"
                  onChange={(file: File | null) => {
                    if (file) {
                      form.setFieldValue("menuImage", file);
                    } else {
                      form.setFieldValue("menuImage", null);
                    }
                  }}
                  placeholder="Menu Image"
                  key={form.values.menuImage ? "" : form.values.menuImage}
                />
              </Container>
              <Flex w={"20%"} align={"center"} justify={"center"}>
                <Avatar
                  src={
                    form.values.menuImage !== null
                      ? URL.createObjectURL(form.values.menuImage)
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
            onClick={closeNewMenuModalForm}
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

export default NewMenu;
