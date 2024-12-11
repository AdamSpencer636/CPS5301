import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const CategoryBreakdown = ({ chartType }) => {
  const data = {
    labels: ["Food", "Entertainment", "Essentials", "Transport", "Other"],
    datasets: [
      {
        label: "Spending Distribution",
        data: [500, 200, 300, 150, 100],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#FFFFFF" } },
    },
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        {chartType === "bar"
          ? "Category Breakdown (Bar)"
          : "Category Breakdown (Pie)"}
      </h2>
      {chartType === "bar" ? (
        <Bar data={data} options={options} />
      ) : (
        <Pie data={data} options={options} />
      )}
    </div>
  );
};

export default CategoryBreakdown;
