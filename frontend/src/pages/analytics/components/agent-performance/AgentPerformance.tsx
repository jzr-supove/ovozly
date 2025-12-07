import { Card } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const AgentPerformance = () => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 380,
      width: "100%",
      redrawOnParentResize: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "Opening +...",
        "Call Adher...",
        "Compliance",
        "Soft Skills",
      ],
      labels: {
        rotate: -45,
      },
    },
    // stroke: {
    //   curve: "stepline",
    //   // OR provide an array
    //   //   curve: ["straight", "smooth", "monotoneCubic", "stepline"],
    // },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}%`,
      },
      //   title: {
      //     text: "Percentage (%)",
      //   },
    },
    // annotations: {
    //   yaxis: [
    //     {
    //       y: 80,
    //       borderColor: "#D35400",
    //       label: {
    //         borderColor: "#D35400",
    //         style: {
    //           color: "#fff",
    //           background: "#D35400",
    //         },
    //         text: "Target",
    //       },
    //     },
    //   ],
    // },
    fill: {
      colors: ["#8ECAE6"],
      opacity: 0.8,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      labels: {
        colors: "#8c8c8c", // Set the legend text color
        useSeriesColors: false, // Use series colors for legend text if set to true
      },
      markers: {
        size: 6,
        fillColors: ["#8ECAE6", "#9E6CD6"],
        shape: "circle",
        offsetX: -3,
      },
    },
    grid: {
      borderColor: "#f5f5f5",
    },
  };

  const series = [
    {
      name: "Team avg.",
      type: "column",
      data: [62, 45, 70, 70],
    },
    {
      name: "Target",
      type: "line",
      data: [80],
    },
  ];
  return (
    <Card
      title="Agent Performance"
      extra={<EllipsisOutlined key="ellipsis" />}
      className="h-100"
    >
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={380}
      />
    </Card>
  );
};

export default AgentPerformance;
