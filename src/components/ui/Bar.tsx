"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../util/supabase/supabaseClient";

const ChartBar = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorySpending();
  }, []);

  const fetchCategorySpending = async () => {
    try {
      const currentYear = new Date().getFullYear();

      // Query purchases to get spending by category and month for the current year
      const { data, error } = await supabase
        .from("purchases")
        .select(
          "input_date, product_category, product_price, product_quantity"
        );

      if (error) {
        console.error("Error fetching spending data:", error);
        return;
      }

      // Filter data for the current year and aggregate spending by category and month
      const filteredData = data.filter(
        (purchase) =>
          new Date(purchase.input_date).getFullYear() === currentYear
      );

      const monthlyCategorySpending = filteredData.reduce((acc, purchase) => {
        const purchaseDate = new Date(purchase.input_date);
        const month = purchaseDate.toLocaleString("default", {
          month: "short",
        }); // Format as "Jan", "Feb", etc.
        const category = purchase.product_category;
        const totalSpent = purchase.product_price * purchase.product_quantity;

        if (!acc[month]) acc[month] = {};
        if (!acc[month][category]) acc[month][category] = 0;

        acc[month][category] += totalSpent;

        return acc;
      }, {});

      // Define chronological order of months
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Sort months based on their order in the `monthOrder` array
      const months = Object.keys(monthlyCategorySpending).sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );

      // Get unique categories
      const categories = [
        ...new Set(filteredData.map((purchase) => purchase.product_category)),
      ];

      // Prepare datasets for the chart
      const datasets = categories.map((category, index) => ({
        label: category,
        data: months.map(
          (month) => monthlyCategorySpending[month][category] || 0
        ),
        backgroundColor: [
          "#FF6384", // Red
          "#36A2EB", // Blue
          "#FFCE56", // Yellow
          "#4BC0C0", // Teal
          "#9966FF", // Purple
          "#FF9F40", // Orange
          "#8B0000", // Dark Red
          "#4682B4", // Steel Blue
          "#FFD700", // Gold
        ][index % 7],
        borderWidth: 1,
      }));

      setChartData({
        labels: months,
        datasets,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      setLoading(false);
    }
  };


  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#FFFFFF",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#FFFFFF",
        },
      },
      y: {
        ticks: {
          color: "#FFFFFF",
        },
        title: {
          display: true,
          text: "Spending ($)",
          color: "#FFFFFF",
        },
      },
    },
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-[800px] bg-inherit p-4 rounded-md">
        {loading ? (
          <p className="text-white text-center">Loading chart data...</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default ChartBar;
