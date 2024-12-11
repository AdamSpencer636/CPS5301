"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../util/supabase/supabaseClient";
import { useUser } from "@clerk/nextjs";

const RecipeFinder = () => {
  const { user } = useUser(); // Clerk user
  const [inventoryData, setInventoryData] = useState([]); // Inventory data
  const [recipes, setRecipes] = useState([]); // Fetched recipes
  const [loadingInventory, setLoadingInventory] = useState(false); // Loading state for inventory
  const [loadingRecipes, setLoadingRecipes] = useState(false); // Loading state for recipes
  const [error, setError] = useState(null); // Error handling

    useEffect(() => {
        if (user) {
            fetchInventoryAndRecipes();
        }
  }, [user]);

  // Fetch inventory and use it to fetch recipes
  const fetchInventoryAndRecipes = async () => {
    setLoadingInventory(true);
    setError(null);

    try {
      // Step 1: Fetch all carts associated with the user
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("cart_id")
        .eq("user_id", user.id); // Adjust with your user retrieval logic

      if (cartError) {
        console.error("Error fetching carts:", cartError);
        setError("Failed to fetch carts.");
        return;
      }

      if (!cartData || cartData.length === 0) {
        console.log("No carts found for this user.");
        setInventoryData([]);
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
        setError("Failed to fetch purchases.");
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
          setError("Failed to fetch product details.");
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

        setInventoryData(inventoryList); // Update state with inventory

        // Step 5: Extract product names for recipe search
        const ingredientList = inventoryList.map((item) => item.name).join(",");

        // Step 6: Fetch recipes using Spoonacular API
        fetchRecipesFromIngredients(ingredientList);
      } else {
        console.log("No products found in purchases.");
        setInventoryData([]);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to fetch inventory.");
    } finally {
      setLoadingInventory(false); // End loading
    }
  };

  // Fetch recipes from Spoonacular API
  const fetchRecipesFromIngredients = async (ingredients) => {
    setLoadingRecipes(true);
    setError(null);

    const apiKey = "aef4397050f64ebb8a32e51eb1853e60"; // Replace with your Spoonacular API key
    const endpoint = `https://api.spoonacular.com/recipes/findByIngredients`;
    console.log("Fetching recipes with ingredients:", ingredients);
    try {
      const response = await axios.get(endpoint, {
        params: {
          ingredients, // Comma-separated ingredient names
          number: 10, // Number of recipes to fetch
          ranking: 2, //minimize missing ingredients
          ignorePantry: true, // Ignore pantry staples
          apiKey,
        },
      });

      setRecipes(response.data); // Update state with recipes
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Failed to fetch recipes.");
    } finally {
      setLoadingRecipes(false); // End loading
    }
  };

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-5">Recipe Finder</h1>

      {/* Inventory Loading State */}
      {loadingInventory && <p className="text-white">Loading inventory...</p>}

      {/* Recipe Loading State */}
      {loadingRecipes && <p className="text-white">Loading recipes...</p>}

      {/* Error Handling */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Recipes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-gray-800 p-4 rounded shadow-md hover:shadow-lg transition"
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-2">{recipe.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Used Ingredients: {recipe.usedIngredientCount}
            </p>
            <p className="text-sm text-gray-400">
              Missing Ingredients: {recipe.missedIngredientCount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeFinder;
