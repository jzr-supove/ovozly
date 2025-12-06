import { Col, Row, Flex, Card, Statistic } from "antd";
import type { StatisticProps } from "antd";
import CountUp from "react-countup";

import StatsCard from "./components/stats-card/StatsCard";
import AgentPerformance from "./components/agent-performance/AgentPerformance";
import TopicUsage from "./components/topic-usage/TopicUsage";

import "./analytics.scss";
import Leaders from "./components/leaders/Leaders";

const Analytics = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp
      start={0}
      end={value as number}
      duration={5}
      decimals={1}
      formattingFn={(value: number) => `${value.toFixed(1)}%`}
    />
  );

  const formatter2: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );
  const formatter3: StatisticProps["formatter"] = (value) => (
    <CountUp
      start={0}
      end={value as number}
      duration={5}
      formattingFn={(value: number) => {
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds < 10 ? `0${seconds}` : seconds}s`;
      }}
    />
  );

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Flex gap={24} justify={"space-between"}>
          <Card className="w-100">
            <Statistic
              className="analytics-stats"
              title="Avg. Agent Performance"
              value={85.6}
              formatter={formatter}
              suffix={
                <CountUp
                  start={0}
                  end={5}
                  prefix="+"
                  duration={15}
                  suffix="%"
                />
              }
            />
          </Card>
          <Card className="w-100">
            <Statistic
              className="analytics-stats"
              title="Avg. Handle Time"
              value={390}
              formatter={formatter3}
              suffix={
                <CountUp start={0} end={5} prefix="-" duration={5} suffix="s" />
              }
            />
          </Card>
          <Card className="w-100">
            <Statistic
              className="analytics-stats"
              title="Conversation Count"
              value={280}
              formatter={formatter2}
              suffix={<CountUp start={0} end={15} prefix="+" duration={10} />}
            />
          </Card>
          <Card className="w-100">
            <Statistic
              className="analytics-stats"
              title="Auto Fails"
              value={12}
              formatter={formatter2}
              suffix={<CountUp start={0} end={3} prefix="-" duration={10} />}
            />
          </Card>
          <StatsCard />
        </Flex>
      </Col>
      <Col span={24}>
        <Row gutter={[24, 24]}>
          <Col span={10}>
            <AgentPerformance />
          </Col>
          <Col span={8}>
            <Leaders />
          </Col>
          <Col span={6}>
            <TopicUsage />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Analytics;
