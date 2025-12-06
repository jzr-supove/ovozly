import { Card, Progress } from "antd";
import "./statscard.scss";
import CountUp from "react-countup";
import { PiSmileyMehBold } from "react-icons/pi";
import { PiSmileySadBold } from "react-icons/pi";
import { PiSmileyBold } from "react-icons/pi";
const StatsCard = () => {
  return (
    <Card className="w-100 customer-sentiment">
      <div className="ant-statistic-title">Avg. Agent Performance</div>
      <div className="d-flex gap-1 justify-content-between">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ gap: "3px" }}
        >
          <PiSmileyBold size={20} color="#D93326" />
          <CountUp
            start={0}
            end={12}
            duration={5}
            suffix="%"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--bs-gray-700)",
            }}
          />
        </div>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ gap: "3px" }}
        >
          <PiSmileyMehBold size={20} color="#F4A91E" />
          <CountUp
            start={0}
            end={71}
            duration={5}
            suffix="%"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--bs-gray-700)",
            }}
          />
        </div>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ gap: "3px" }}
        >
          <PiSmileySadBold size={20} color="#1EB96D" />
          <CountUp
            start={0}
            end={15}
            duration={5}
            suffix="%"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--bs-gray-700)",
            }}
          />
        </div>
      </div>
      <div className="d-flex gap-1">
        <div style={{ width: "12%" }}>
          <Progress percent={100} showInfo={false} strokeColor={"#D93326"} />
        </div>
        <div style={{ width: "71%" }}>
          <Progress percent={100} showInfo={false} strokeColor={"#F4A91E "} />
        </div>
        <div style={{ width: "15%" }}>
          <Progress percent={100} showInfo={false} strokeColor={"#1EB96D"} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;

{
  /* <Statistic
title="Active"
value={"11.28 %"}
precision={2}
valueStyle={{ color: "#3f8600" }}
suffix="+5%"
className="analytics-stats"
/> */
}
