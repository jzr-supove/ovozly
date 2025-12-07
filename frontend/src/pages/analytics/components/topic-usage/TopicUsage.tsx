import { Card } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const TopicUsage = () => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 380,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "65%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "Reorder Pres...",
        "Reset Passw...",
        "Cancel Order",
        "Add New Driv...",
        "Support Requ...",
        "Order Ice Cr...",
        "Make Payment",
        "Unsubscribe",
        "Change Addre...",
        "Insurance Qu...",
        "Book Appoint...",
        "Report LostC...",
      ],
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    fill: {
      colors: ["#A78BFA"],
    },
    grid: {
      borderColor: "#f5f5f5",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} intents`,
      },
    },
  };

  const series = [
    {
      name: "# of intents",
      data: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4],
    },
  ];

  return (
    <Card
      title="Topic Usage"
      extra={<EllipsisOutlined key="ellipsis" />}
      className="h-100"
    >
      <div className="chart_total">
        <span className="chart_total__main me-2">
          <span>297</span>
        </span>
        <span className="chart_total__sub">
          <span>topics</span>
        </span>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={400}
      />
    </Card>
  );
};

export default TopicUsage;
