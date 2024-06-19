import React, { useState, useEffect } from "react";
import {
  ActionIcon, Avatar, Badge, Divider, Group, Menu, Paper, Space, Table, Title,
} from "@mantine/core";
import {  IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { color } from "../../../../lib/colors";
import { STATUS } from "../../../../lib/enum";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";
import useShowAndUpdateNotification from "../../../../global/components/show-and-update-notification";

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
const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

type MenuItem = {
  id: string;
  menuImage: string;
  foodName: string;
  price: number;
  statusMode: STATUS;
};

const MenuTable: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const { showNotification } = useShowAndUpdateNotification();

  useEffect(() => {
    const fetchMenus = async () => {
      const menusRef = ref(database, "MENUS");
      try {
        const snapshot = await get(menusRef);
        if (snapshot.exists()) {
          const menusData = snapshot.val();
          const menusArray = Object.keys(menusData).map((key) => ({
            name: key,
            items: Object.values(menusData[key]),
          }));
          setMenus(menusArray);
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      const selectedMenuItems =
        menus.find((m) => m.name === selectedMenu.name)?.items || [];
      setFilteredItems(selectedMenuItems);
    }
  }, [selectedMenu, menus]);

  useEffect(() => {
    if (menus.length > 0) {
      const defaultMenu = menus.find((m) => m.name === "Breakfast");
      if (defaultMenu) {
        setSelectedMenu(defaultMenu);
        const defaultMenuItems = defaultMenu.items || [];
        setFilteredItems(defaultMenuItems);
      }
    }
  }, [menus]);

  const handleMenuSelect = (menu: MenuItem) => {
    setSelectedMenu(menu);
    const selectedMenuItems = menus.find((m) => m.name === menu.foodName)?.items || [];
    setFilteredItems(selectedMenuItems);
  };

const handleDeleteItem = (item: MenuItem) => {
    const itemRef = ref(
      database,
      `MENUS/${selectedMenu.name}/${item.id}`
    );
    remove(itemRef)
      .then(() => {
        // Item deleted successfully
        console.log("Item deleted successfully");
        showNotification({
          id: "delete-menu",
          message: `${item.foodName} deleted successfully`,
          title: "Deletion",
          color: "green",
          icon: <IconTrash />,
        });

        // Refresh the filtered items list after deletion
        const updatedItems = filteredItems.filter(
          (filteredItem) => filteredItem.id !== item.id
        );
        setFilteredItems(updatedItems);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        showNotification({
          id: "delete-menu",
          message: `Error deleting ${item.foodName}: ${error.message}`,
          title: "Deletion Error",
          color: "red",
          icon: <IconTrash />,
        });
      });
  };

  return (
    <Paper p={"md"} shadow="md" w={"100%"} radius={"md"}>
      <Group justify="space-between">
        <Group>
          <Title order={2} c={`${color.blue_950}`}>
            Menu
          </Title>
          <Divider orientation="vertical" size={"lg"} />
          <Title order={3} c={`${color.dimmed}`}>
            {/* Display the selected status mode */}
            {/* For example: {statusMode} */}
            {selectedMenu ? selectedMenu.name : ''}
          </Title>
        </Group>
        <Menu position="bottom" withArrow width={200} shadow="md">
          <Menu.Target>
            <IconDots />
          </Menu.Target>
          <Menu.Dropdown>
            {/* Map through the menus state to render dropdown items */}
            {menus.map((menu, index) => (
              <Menu.Item key={index} onClick={() => handleMenuSelect(menu)}>
                {menu.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>

        </Menu>
      </Group>

      <Space h={"md"} />

      <Table.ScrollContainer minWidth={700} type="native" mah={380}>
        <Table horizontalSpacing="md" verticalSpacing="xs" layout="fixed">
          <Table.Tbody>
            {filteredItems.map((item, index) => (
              <React.Fragment key={index}>
                <Table.Tr>
                  <Table.Td>
                    <Avatar src={item.menuImage} radius="md" size={"lg"} />
                  </Table.Td>
                  <Table.Td>{item.foodName}</Table.Td>
                  <Table.Td>{item.price} Tshs</Table.Td>
                  <Table.Td>
                    <Badge bg={`${item.statusMode === STATUS.AVAILABLE ? color.green : color.red}`} w={120} py={"xs"}>
                      {item.statusMode}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <ActionIcon variant="light" size={"lg"}>
                        <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        c={`${color.red}`}
                        size={"lg"}
                        onClick={() => handleDeleteItem(item)}
                      >
                        <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                {/* Add a divider after each menu item */}
                <Table.Tr>
                  <Table.Td colSpan={5}><Divider size="sm" /></Table.Td>
                </Table.Tr>
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};

export default MenuTable;
