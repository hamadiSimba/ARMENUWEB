import {
  ActionIcon,
  Anchor,
  Avatar,
  Center,
  Divider,
  Flex,
  Group,
  Menu,
  Modal,
  Paper,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  keys,
  rem,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconSearch,
  IconSelector,
  IconSettings,
  IconStatusChange,
  IconTrash,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import classes from "../../../../global/css/TableSort.module.css";
import { STAFF_DATA, STAFF_DATA_TYPE, deleteStaffFromFirebase, fetchDataFromFirebase } from "../staff-data";
import { useDisclosure } from "@mantine/hooks";
import { STAFF_STATUS } from "../../../../lib/enum";
import { color } from "../../../../lib/colors";
import StaffInformation from "./staff-information";
import useShowAndUpdateNotification from "../../../../global/components/show-and-update-notification";

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

const { showNotification } = useShowAndUpdateNotification();

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data: STAFF_DATA_TYPE[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  );
}

function sortData(
  data: STAFF_DATA_TYPE[],
  payload: {
    sortBy: keyof STAFF_DATA_TYPE | null;
    reversed: boolean;
    search: string;
  }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

//   MAIN FUNCTION
const StaffTable: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(STAFF_DATA);
  const [sortBy, setSortBy] = useState<keyof STAFF_DATA_TYPE | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const [openedStaffInfo, { open, close }] = useDisclosure(false);
  const [selectedStaff, setSelectedStaff] = useState<{
    email: string;
    name: string;
  } | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const setSorting = (field: keyof STAFF_DATA_TYPE) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(STAFF_DATA, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(STAFF_DATA, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const handleDelete = async (staffId: string) => {
    try {
      await deleteStaffFromFirebase(staffId);
      // Show notification
      showNotification({
        id: "delete",
        message: "Staff member successfully deleted.",
        title: "Deletion",
        color: "red",
        icon: <IconCheck />,
      });
      // Remove the deleted staff member from the local state
      setSortedData((prevData) => prevData.filter((staff) => staff.id !== staffId));
    } catch (error) {
      console.error("Error deleting staff member:", error);
      // Show error notification
      showNotification({
        id: "delete-error",
        message: "Failed to delete staff member.",
        title: "Error",
        color: "red",
        icon: <IconCheck />,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDataFromFirebase();
      setSortedData(data);
    };

    fetchData();
  }, []);

  const rows = sortedData.map((row: STAFF_DATA_TYPE, index) => (
    <Table.Tr
      key={row.username}
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor:
          hoveredItem === index ? color.semi_transparent_blue : color.white,
      }}
    >
      <Table.Td>
        <UnstyledButton>
          <Flex wrap="wrap" gap={"sm"} align="center" direction={"row"}>
            <Avatar src={row.passport} radius="xl" />

            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {row.username}
              </Text>
            </div>
          </Flex>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <Anchor fz="sm" href={`mailto:${row.email}`}>
          {row.email}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Anchor fz="sm" href={`tell:${row.mobile}`}>
          {row.mobile}
        </Anchor>
      </Table.Td>

      <Table.Td>
        <Group>
          <ActionIcon
            variant="light"
            size={"lg"}
            onClick={() => {
              setSelectedStaff({ email: row.email, name: row.username });
              open();
            }}
          >
            <IconEye style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>

          <Menu position="bottom" withArrow width={200} shadow="md">
            <Menu.Target>
              <ActionIcon variant="light" size={"lg"}>
                <IconSettings
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item c={`${color.dimmed}`}>Actions</Menu.Item>
              <Menu.Item>
                <Group>
                  <IconStatusChange />
                  {row.status === STAFF_STATUS.ACTIVE
                    ? STAFF_STATUS.INACTIVE
                    : STAFF_STATUS.ACTIVE}
                </Group>
              </Menu.Item>
              <Menu.Item onClick={() => handleDelete(row.id)}>
                <Group c={`${color.red}`}>
                  <IconTrash />
                  <Text>Delete</Text>
                </Group>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Modal
        opened={openedStaffInfo}
        onClose={close}
        title={
          <Text c={`${color.blue_950}`}>{selectedStaff?.name} Information</Text>
        }
        radius={"md"}
        centered
        size={"xl"}
        withCloseButton
        transitionProps={{
          transition: "fade",
          duration: 600,
          timingFunction: "linear",
        }}
        closeOnClickOutside={false}
      >
        <Divider size={"sm"} />

        <StaffInformation data={{ email: selectedStaff?.email }} />
      </Modal>

      <Paper p={30} radius="md" shadow="sm">
        <Flex justify="space-between" gap={"md"}>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={
              <IconSearch
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            value={search}
            onChange={handleSearchChange}
            w={{ base: "100%", sm: "100%", md: "60%", lg: "50%", xl: "40%" }}
          />
        </Flex>
        <Table.ScrollContainer minWidth={1500} type="native">
          <Table horizontalSpacing="md" verticalSpacing="xs" layout="fixed">
            <Table.Tbody>
              <Table.Tr bg={`${color.blue_100}`}>
                <Th
                  sorted={sortBy === "username"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("username")}
                >
                  Name
                </Th>
                <Th
                  sorted={sortBy === "email"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("email")}
                >
                  Email
                </Th>
                <Th
                  sorted={sortBy === "mobile"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("mobile")}
                >
                  Mobile
                </Th>
                
                <Th sorted={false} reversed={false} onSort={() => {}}>
                  Actions
                </Th>
              </Table.Tr>
            </Table.Tbody>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </div>
  );
};

export default StaffTable;
