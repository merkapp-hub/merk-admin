"use client";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const LineChart = ({ data }) => {
  console.log(data, "line chart data");
  if (!data || !Array.isArray(data.series) || !Array.isArray(data.categories)) {
    return <div>Loading...</div>;
  }
  const chartData = {
    series: data.series,
    options: {
      chart: {
        height: 350,
        type: "line",
        zoom: { enabled: false },
        foreColor: "#000000",
        toolbar: {
          show: false,
        },
      },
      theme: {
        mode: "light",
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      // title: {
      //   text: "Product Sales",
      //   align: "left",
      //   style: {
      //     color: "#000000",
      //   },
      // },
      xaxis: {
        categories: data.categories,
        labels: {
          style: {
            colors: "#000000", // 💡 y-axis labels
          },
        },
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={chartData?.options}
        series={chartData?.series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default LineChart;
