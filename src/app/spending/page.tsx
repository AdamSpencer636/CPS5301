"use client";
import SpendingTrends from "../../components/ui/SpendingTrends";
import PieChart from "../../components/ui/Pie";
import ChartBar from "../../components/ui/Bar";
import Insights from "../../components/ui/Insights";
import LineChart from "@/components/ui/Line";

const AnalyticsPage = () => {
  return (
		<div className="p-5 bg-gray-900 text-white min-h-screen">
			{/* Title Section */}
			<h1 className="text-4xl font-bold mb-8 text-center">
				Spending Analytics Dashboard
			</h1>

			{/* Main Grid Layout */}
			<div className="grid grid-rows-3 gap-8">
				{/* Row 1: Spending Trends and Insights */}
				<div className="grid grid-cols-2 gap-5">
					<div className="col-span-1 bg-gray-800 p-5 rounded-md shadow-md">
						<LineChart />
					</div>
					<div className="col-span-1 bg-gray-800 p-5 rounded-md shadow-md">
						<Insights />
					</div>
				</div>

				{/* Row 2: Category Breakdown */}
				<div className="grid grid-cols-2 gap-5">
					<div className="col-span-1 bg-gray-800 p-5 rounded-md shadow-md">
						<ChartBar />
					</div>
					<div className="col-span-1 bg-gray-800 p-5 rounded-md shadow-md">
						<PieChart />
					</div>
				</div>
			</div>
		</div>
  );
};

export default AnalyticsPage;
