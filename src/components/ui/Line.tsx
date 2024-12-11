"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../util/supabase/supabaseClient";
import { Chip } from "@nextui-org/react";
import UseAnimations from "react-useanimations";
import arrowDown from "react-useanimations/lib/arrowDown";
import arrowUp from "react-useanimations/lib/arrowUp";

const LineChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpendingOverTime();
  }, []);

  const fetchSpendingOverTime = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("input_date, product_price, product_quantity");

      if (error) {
        console.error("Error fetching spending data:", error);
        return;
      }

      // Aggregate spending by month
      const spendingByMonth = data.reduce((acc, purchase) => {
        const purchaseDate = new Date(purchase.input_date);
        const month = purchaseDate.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        const totalSpent = purchase.product_price * purchase.product_quantity;

        if (acc[month]) {
          acc[month] += totalSpent;
        } else {
          acc[month] = totalSpent;
        }
        return acc;
      }, {});

      // Prepare data for the chart
      const labels = Object.keys(spendingByMonth).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const values = labels.map((label) => spendingByMonth[label]);

      setChartData({
        labels,
        datasets: [
          {
            label: "Spending Over Time",
            data: values,
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "#36A2EB",
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0; // Avoid division by zero
    return ((current - previous) / previous) * 100;
  };

  const getComparisonData = () => {
    if (!chartData || chartData.labels.length < 2) {
      return { lastMonth: null, ytd: null, threeMonth: null };
    }

    const data = chartData.datasets[0].data;
    const labels = chartData.labels;

    const lastMonthIndex = data.length - 1;
    const secondLastMonthIndex = lastMonthIndex - 1;

    // Previous month
    const currentMonthSpending = data[lastMonthIndex];
    const previousMonthSpending =
      secondLastMonthIndex >= 0 ? data[secondLastMonthIndex] : null;
    const lastMonthChange = previousMonthSpending
      ? calculatePercentageChange(currentMonthSpending, previousMonthSpending)
      : null;

    // Previous year (same month)
    const currentMonthLabel = labels[lastMonthIndex];
    const currentMonthDate = new Date(currentMonthLabel);
    const previousYearLabel = new Date(
      currentMonthDate.setFullYear(currentMonthDate.getFullYear() - 1)
    ).toLocaleString("default", { month: "short", year: "numeric" });
    const previousYearIndex = labels.indexOf(previousYearLabel);
    const previousYearSpending =
      previousYearIndex >= 0 ? data[previousYearIndex] : null;
    const ytdChange = previousYearSpending
      ? calculatePercentageChange(currentMonthSpending, previousYearSpending)
      : null;

    // Last three months
    const threeMonthsData = data.slice(-3);
    const threeMonthsAvg =
      threeMonthsData.length > 0
        ? threeMonthsData.reduce((acc, val) => acc + val, 0) /
          threeMonthsData.length
        : null;
    const threeMonthChange = threeMonthsAvg
      ? calculatePercentageChange(currentMonthSpending, threeMonthsAvg)
      : null;

    return {
      lastMonthChange,
      ytdChange,
      threeMonthChange,
    };
  };

  const { lastMonthChange, ytdChange, threeMonthChange } = getComparisonData();

  return (
    <div className="flex flex-col gap-3 justify-center items-center">
      {/* Line Chart */}
      <div className="w-full bg-inherit p-4 rounded-md shadow-md">
        {loading ? (
          <p className="text-white text-center">Loading chart data...</p>
        ) : (
          <Line data={chartData} options={{ responsive: true }} />
        )}
      </div>

      {/* Chips for Comparisons */}
      <div className="flex flex-wrap justify-between gap-3 w-full mt-5">
        {/* Last Month Change */}
        {lastMonthChange !== null && (
          <Chip
            color={lastMonthChange >= 0 ? "danger" : "success"}
            className="text-black"
            startContent={
              lastMonthChange >= 0 ? (
                <UseAnimations animation={arrowUp} size={30} />
              ) : (
                <UseAnimations animation={arrowDown} size={30} />
              )
            }
          >
            {`${Math.abs(lastMonthChange).toFixed(2)}% ${
              lastMonthChange >= 0 ? "increase" : "decrease"
            } compared to last month`}
          </Chip>
        )}

        {/* Year-to-Date Change */}
        {ytdChange !== null && (
          <Chip
            color={ytdChange >= 0 ? "danger" : "success"}
            className="text-black"
            startContent={
              ytdChange >= 0 ? (
                <UseAnimations animation={arrowUp} size={30} />
              ) : (
                <UseAnimations animation={arrowDown} size={30} />
              )
            }
          >
            {`${Math.abs(ytdChange).toFixed(2)}% ${
              ytdChange >= 0 ? "increase" : "decrease"
            } year to date`}
          </Chip>
        )}

        {/* Three-Month Change */}
        {threeMonthChange !== null && (
          <Chip
            color={threeMonthChange >= 0 ? "danger" : "success"}
            className="text-black"
            startContent={
              threeMonthChange >= 0 ? (
                <UseAnimations animation={arrowUp} size={30} />
              ) : (
                <UseAnimations animation={arrowDown} size={30} />
              )
            }
          >
            {`${Math.abs(threeMonthChange).toFixed(2)}% ${
              threeMonthChange >= 0 ? "increase" : "decrease"
            } over last 3 months`}
          </Chip>
        )}
      </div>
    </div>
  );
};

export default LineChart;
