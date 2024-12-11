import { Card } from "@nextui-org/react";
import "chart.js/auto";

const Insights = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Overall Insights</h2>
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-gray-700 p-5">
          <h3 className="text-lg font-bold">Total Spending</h3>
          <p className="text-lg mt-2">$22,322</p>
        </Card>
        <Card className="bg-gray-700 p-5">
          <h3 className="text-lg font-bold">Monthly Increase</h3>
          <p className="text-lg mt-2">93% more than last month</p>
        </Card>
        <Card className="bg-gray-700 p-5">
          <h3 className="text-lg font-bold">Top Category</h3>
          <p className="text-lg mt-2">Dairy ($10140)</p>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
