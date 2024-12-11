import { Line } from "react-chartjs-2";
import "chart.js/auto";

const SpendingTrends = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Spending ($)",
        data: [200, 250, 300, 220, 310, 280],
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#FFFFFF" } },
    },
    scales: {
      x: { ticks: { color: "#FFFFFF" } },
      y: { ticks: { color: "#FFFFFF" } },
    },
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Spending Trends</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default SpendingTrends;
