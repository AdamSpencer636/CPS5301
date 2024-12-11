"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
  Card,
  Button,
  Input,
  Skeleton,
} from "@nextui-org/react";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { supabase } from "../../util/supabase/supabaseClient";

const CartPage = () => {
  const { user } = useUser(); // Clerk user
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // Track search input
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true); // Start loading
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
      setFilteredProducts(data); // Initialize filtered products
    }
    setLoading(false); // End loading
  };

  const fetchCart = async () => {
    setLoading(true); // Start loading
    if (!user) return;
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", user.id);

    if (cartError) {
      console.error("Error fetching cart:", cartError);
    } else {
      setCart(cartData[0]);
      const { data: cartItemsData, error: cartItemsError } = await supabase
        .from("purchases")
        .select("*")
        .eq("cart_id", cartData[0].cart_id);

      if (cartItemsError) {
        console.error("Error fetching cart items:", cartItemsError);
      } else {
        setCartItems(cartItemsData);
        calculateTotal(cartItemsData);
      }
    }
    setLoading(false); // End loading
  };

  const calculateTotal = (items) => {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.product_price * item.product_quantity,
      0
    );
    setTotal(totalAmount.toFixed(2));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const addToCart = async (product) => {
    if (!cart) return;

    const existingItem = cartItems.find(
      (item) => item.product_id === product.product_id
    );

    if (existingItem) {
      const { error } = await supabase
        .from("purchases")
        .update({ product_quantity: existingItem.product_quantity + 1 })
        .eq("purchase_id", existingItem.purchase_id);

      if (error) {
        console.error("Error updating cart item:", error);
      }
    } else {
      const { error } = await supabase.from("purchases").insert({
        cart_id: cart.cart_id,
        product_id: product.product_id,
        product_price: product.unit_quantity,
        product_quantity: 1,
        purchase_id: Math.floor(100000 + Math.random() * 900000), // Generate random 6 digit number
      });

      if (error) {
        console.error("Error adding to cart:", error);
      }
    }

    fetchCart();
  };

  const removeFromCart = async (purchaseId) => {
    const { error } = await supabase
      .from("purchases")
      .delete()
      .eq("purchase_id", purchaseId);
    if (error) {
      console.error("Error removing from cart:", error);
    }
    fetchCart();
  };

  if (!user) return <RedirectToSignIn />;

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      {/* Top Stats Section */}
      <div className="flex justify-between items-center mb-5">
        <Skeleton isLoaded={!loading}>
          <Card className="bg-gray-800 p-5 mr-5 w-full">
            <h2 className="text-2xl font-bold">Total Items</h2>
            <p className="text-xl mt-2">{cartItems.length} items</p>
          </Card>
        </Skeleton>
        <Skeleton isLoaded={!loading}>
          <Card className="bg-gray-800 p-5 w-full">
            <h2 className="text-2xl font-bold">Total Cost</h2>
            <p className="text-xl mt-2">${total}</p>
          </Card>
        </Skeleton>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <Skeleton isLoaded={!loading}>
          <Input
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-800 text-white"
          />
        </Skeleton>
      </div>

      {/* Product List */}
      <h2 className="text-xl font-semibold mb-5">Purchase History</h2>
      <Skeleton isLoaded={!loading}>
        <div className="overflow-y-auto max-h-[300px] rounded-lg">
          <Table aria-label="Product List" className="bg-gray-800 text-white rounded-lg">
            <TableHeader>
              <TableColumn>Product Name</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.unit_quantity.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Skeleton>

      {/* Cart Items */}
      <h2 className="text-xl font-semibold mt-10 mb-5">Cart Items</h2>
      <Skeleton isLoaded={!loading}>
        <Table aria-label="Cart Items" className="bg-gray-800 text-white rounded-lg">
          <TableHeader>
            <TableColumn>Product Name</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn>Total</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.purchase_id}>
                <TableCell>
                  {
                    products.find((p) => p.product_id === item.product_id)
                      ?.product_name
                  }
                </TableCell>
                <TableCell>{item.product_quantity}</TableCell>
                <TableCell>${item.product_price.toFixed(2)}</TableCell>
                <TableCell>
                  ${(item.product_price * item.product_quantity).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => removeFromCart(item.purchase_id)}
                  >
                    Remove
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

export default CartPage;
