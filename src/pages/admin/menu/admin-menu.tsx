import {
  Button,
  Container,
  Divider,
  Flex,
  Modal,
  Space,
  Text,
  Title,
} from "@mantine/core";
import React from "react";
import { color } from "../../../lib/colors";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import MenuTable from "./components/menu-table";
import NewMenu from "./components/new-menu";

const AdminMenu: React.FC = () => {
  const [opened, { open, close }] = useDisclosure();

  return (
    <div>
      <Container size={"xl"}>
        <Modal
          opened={opened}
          onClose={close}
          title={<Text c={`${color.blue_950}`}>New Menu</Text>}
          radius={"md"}
          centered
          withCloseButton
          transitionProps={{
            transition: "fade",
            duration: 600,
            timingFunction: "linear",
          }}
          closeOnClickOutside={false}
        >
          <Divider size={"sm"} />

          <NewMenu closeNewMenuModalForm={close} />
        </Modal>

        <Flex justify={"space-between"} direction={"row"} align={"center"}>
          <Title order={3} c={`${color.blue_950}`}>
            Menu List
          </Title>
          <Button
            rightSection={<IconPlus />}
            variant="default"
            onClick={open}
            c={`${color.blue_950}`}
          >
            New Menu
          </Button>
        </Flex>

        <Space h={"md"} />

        <MenuTable />
      </Container>
    </div>
  );
};

export default AdminMenu;
