'use client';
import { Card } from "@nextui-org/react";

const ItemCard = ({ itemName, quantity, price}) => {
  return (
    <Card className="bg-gray-800 text-white rounded-lg shadow-md border-2 border-white dark:shadow-white light:shadow-black">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h4 className="text-xl font-semibold">{itemName}</h4>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <p className="text-base mb-2">
          <span className="font-medium">Quantity:</span> {quantity}
        </p>
      </div>
    </Card>
  );
};

export default ItemCard;
