"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
  Progress,
  Chip,
  Button,
  Card,
  Skeleton,
} from "@nextui-org/react";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { supabase } from "../../util/supabase/supabaseClient";

const InventoryPage = () => {
  const { user } = useUser(); // Clerk user
  const [inventoryData, setInventoryData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [inStockCount, setInStockCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [threshold, setThreshold] = useState(3);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  // Fetch Inventory Data from Supabase
  const fetchInventory = async () => {
    setLoading(true); // Start loading

    try {
      // Step 1: Fetch all carts associated with the user
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("cart_id")
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Error fetching carts:", cartError);
        return;
      }

      if (!cartData || cartData.length === 0) {
        console.log("No carts found for this user.");
        setInventoryData([]); // Set empty inventory
        calculateStockMetrics([]);
        return;
      }

      // Extract cart IDs
      const cartIds = cartData.map((cart) => cart.cart_id);

      // Step 2: Fetch all purchases associated with the user's carts
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select("product_id, product_quantity")
        .in("cart_id", cartIds);

      if (purchasesError) {
        console.error("Error fetching purchases:", purchasesError);
        return;
      }

      // Step 3: Aggregate quantities by product_id to form inventory
      const inventory = {};
      purchasesData.forEach((purchase) => {
        const { product_id, product_quantity } = purchase;
        if (!inventory[product_id]) {
          inventory[product_id] = { product_id, quantity: product_quantity };
        } else {
          inventory[product_id].quantity += product_quantity;
        }
      });

      // Step 4: Fetch product details for the aggregated product_ids
      const productIds = Object.keys(inventory);
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("product_id, product_name, category, unit_quantity")
          .in("product_id", productIds);

        if (productsError) {
          console.error("Error fetching product details:", productsError);
          return;
        }

        // Merge product details into inventory
        const inventoryList = productsData.map((product) => ({
          id: product.product_id,
          name: product.product_name,
          category: product.category,
          price: product.unit_quantity,
          quantity: inventory[product.product_id].quantity,
          threshold: 5, // Static threshold for low stock
        }));

        // Step 5: Update state with the fetched inventory and metrics
        setInventoryData(inventoryList);
        calculateStockMetrics(inventoryList);
      } else {
        console.log("No products found in purchases.");
        setInventoryData([]);
        calculateStockMetrics([]);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false); // End loading
    }
  };


  const calculateStockMetrics = (data) => {
    const total = data.length;
    const inStock = data.filter((item) => item.quantity > threshold).length;
    const lowStock = data.filter(
      (item) => item.quantity > 0 && item.quantity <= threshold
    ).length;
    const outOfStock = data.filter((item) => item.quantity === 0).length;

    setTotalItems(total);
    setInStockCount(inStock);
    setLowStockCount(lowStock);
    setOutOfStockCount(outOfStock);
  };

  const incrementQuantity = (index) => {
    const item = inventoryData[index];
    const updatedQuantity = item.quantity + 1;

    setInventoryData((prevData) =>
      prevData.map((product, i) =>
        i === index ? { ...product, quantity: updatedQuantity } : product
      )
    );

    calculateStockMetrics(
      inventoryData.map((product, i) =>
        i === index ? { ...product, quantity: updatedQuantity } : product
      )
    );
  };

  const decrementQuantity = (index) => {
    const item = inventoryData[index];
    if (item.quantity === 0) return;

    const updatedQuantity = item.quantity - 1;

    setInventoryData((prevData) =>
      prevData.map((product, i) =>
        i === index ? { ...product, quantity: updatedQuantity } : product
      )
    );

    calculateStockMetrics(
      inventoryData.map((product, i) =>
        i === index ? { ...product, quantity: updatedQuantity } : product
      )
    );
  };

  const addToList = (item) => {
    alert(`${item.name} added to list!`);
  };

  const calculateStatus = (quantity, threshold) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= threshold) return "Low Stock";
    return "In Stock";
  };

  if (!user) return <RedirectToSignIn />;

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      {/* Top Stats Section */}
      <div className="flex justify-between items-center mb-5">
        <Skeleton isLoaded={!loading}>
          <Card className="bg-gray-800 p-5">
            <h2 className="text-2xl font-bold">Total Items</h2>
            <p className="text-xl mt-2">{totalItems} products</p>
          </Card>
        </Skeleton>
        <div className="flex space-x-5">
          <Skeleton isLoaded={!loading}>
            <Card className="bg-gray-800 p-5">
              <h3 className="text-lg font-semibold">In Stock</h3>
              <Progress
                color="success"
                value={(inStockCount / totalItems) * 100}
                className="mt-2"
              />
              <p className="mt-1 text-sm">{inStockCount} items</p>
            </Card>
          </Skeleton>
          <Skeleton isLoaded={!loading}>
            <Card className="bg-gray-800 p-5">
              <h3 className="text-lg font-semibold">Low Stock</h3>
              <Progress
                color="warning"
                value={(lowStockCount / totalItems) * 100}
                className="mt-2"
              />
              <p className="mt-1 text-sm">{lowStockCount} items</p>
            </Card>
          </Skeleton>
          <Skeleton isLoaded={!loading}>
            <Card className="bg-gray-800 p-5">
              <h3 className="text-lg font-semibold">Out of Stock</h3>
              <Progress
                color="danger"
                value={(outOfStockCount / totalItems) * 100}
                className="mt-2"
              />
              <p className="mt-1 text-sm">{outOfStockCount} items</p>
            </Card>
          </Skeleton>
        </div>
      </div>

      {/* Inventory Table */}
      <Skeleton isLoaded={!loading}>
        <Table
          aria-label="Inventory Table"
          className="overflow-y-auto max-h-[calc(100vh-20rem)] bg-gray-800 text-white rounded-lg"
        >
          <TableHeader>
            <TableColumn>Item ID</TableColumn>
            <TableColumn>Name</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Actions</TableColumn>
            <TableColumn>Add to List</TableColumn>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip
                    color={
                      calculateStatus(item.quantity, threshold) ===
                      "Out of Stock"
                        ? "danger"
                        : calculateStatus(item.quantity, threshold) ===
                          "Low Stock"
                        ? "warning"
                        : "success"
                    }
                  >
                    {calculateStatus(item.quantity, threshold)}
                  </Chip>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => incrementQuantity(index)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      onPress={() => decrementQuantity(index)}
                      disabled={item.quantity === 0}
                    >
                      -
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="success"
                    onPress={() => addToList(item)}
                    disabled={item.quantity === 0}
                  >
                    Add to List
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Skeleton>
    </div>
  );
};

export default InventoryPage;
