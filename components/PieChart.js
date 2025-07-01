"use client";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const PieChart = ({ data }) => {
  console.log(data, "pie chart data");
  if (!data || !Array.isArray(data.series) || !Array.isArray(data.categories)) {
    return <div>Loading...</div>;
  }
  const chartData = {
    series: data?.series,
    options: {
      chart: {
        type: "donut",
        foreColor: "#000000",
      },
      labels: data?.categories,
      legend: {
        labels: {
          colors: "#000000",
        },
      },
      theme: {
        mode: "light",
      },
      tooltip: {
        y: {
          formatter: (val) => `$${val}`,
        },
      },
      dataLabels: {
        formatter: function (val, opts) {
          const raw = opts.w.config.series[opts.seriesIndex];
          return `${raw}$`;
        },
        style: {
          colors: ["#ffffff"],
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" },
          },
        },
      ],
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={chartData?.options}
        series={chartData?.series}
        type="donut"
        height={350}
      />
    </div>
  );
};

export default PieChart;
