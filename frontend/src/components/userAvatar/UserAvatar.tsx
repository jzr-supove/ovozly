import { Avatar, Dropdown, MenuProps, Space } from "antd";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";

const items: MenuProps["items"] = [
  {
    key: "1",
    label: "My Account",
    disabled: true,
  },
  {
    type: "divider",
  },
  {
    key: "2",
    label: "Profile",
  },
  {
    key: "3",
    label: "Billing",
  },
  {
    key: "4",
    label: "Settings",
    icon: <SettingOutlined />,
  },
];

const UserAvatar = () => {
  return (
    <Dropdown menu={{ items }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <Avatar style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}>
            U
          </Avatar>
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default UserAvatar;
