import { Badge } from "antd";
import { IoMdNotificationsOutline } from "react-icons/io";

export const Notifications = () => {
  return (
    <Badge
      count={0}
      //dot={true}
    >
      <IoMdNotificationsOutline size={25} />
    </Badge>
  );
};
