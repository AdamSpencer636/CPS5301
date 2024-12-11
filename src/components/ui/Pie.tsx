"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../util/supabase/supabaseClient";

const PieChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorySpending();
  }, []);

  const fetchCategorySpending = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("product_category, product_price, product_quantity");

      if (error) {
        console.error("Error fetching spending data:", error);
        return;
      }

      const categorySpending = data.reduce((acc, purchase) => {
        const totalSpent = purchase.product_price * purchase.product_quantity;
        if (acc[purchase.product_category]) {
          acc[purchase.product_category] += totalSpent;
        } else {
          acc[purchase.product_category] = totalSpent;
        }
        return acc;
      }, {});

      const labels = Object.keys(categorySpending);
      const values = Object.values(categorySpending);

      const backgroundColors = [
        "#FF6384", // Red
        "#36A2EB", // Blue
        "#FFCE56", // Yellow
        "#4BC0C0", // Teal
        "#9966FF", // Purple
        "#FF9F40", // Orange
        "#8B0000", // Dark Red
        "#4682B4", // Steel Blue
        "#FFD700", // Gold
      ].slice(0, labels.length);

      const borderColors = backgroundColors.map((color) =>
        color.replace("0.6", "1")
      ); // Matching border colors

      setChartData({
        labels,
        datasets: [
          {
            label: "Spending by Category",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#FFFFFF",
        },
      },
    },
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-[400px] bg-inherit p-4 rounded-md shadow-md">
        {loading ? (
          <p className="text-white text-center">Loading chart data...</p>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default PieChart;
