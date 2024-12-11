"use client";

import React, { useState, useEffect } from "react";
import ChartBar from "../../components/ui/Bar";
import LineChart from "../../components/ui/Line";
import PieChart from "../../components/ui/Pie";
import ItemCard from "../../components/ui/Card";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import {
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Button,
} from "@nextui-org/react";
import { supabase } from "../../util/supabase/supabaseClient";

const Dashboard = () => {
	const [groceryLists, setGroceryLists] = useState([]); // All grocery lists
	const [currentListId, setCurrentListId] = useState(null); // ID of the selected list
	const [currentListItems, setCurrentListItems] = useState([]); // Items of the selected list
	const [userName, setUserName] = useState(null); // User's name

  const { user } = useUser();

	// Load user data and grocery lists
	useEffect(() => {
		const fetchData = async () => {
			
			if (!user) {
				return <RedirectToSignIn />;
			}
			setUserName(user?.username);

			await fetchGroceryLists();
		};

		fetchData();
	}, []); // Run once on mount

	// Fetch grocery lists from Supabase
	const fetchGroceryLists = async () => {
		const { data, error } = await supabase
			.from("grocery_lists")
			.select("*");

		if (error) {
			console.error("Error fetching grocery lists:", error);
			return;
		}

		setGroceryLists(data);

		if (data.length > 0) {
			setCurrentListId(data[0].id); // Default to the first list
			setCurrentListItems(JSON.parse(data[0].items) || []); // Parse the first list's items
		}
	};

	// Handle list selection from dropdown
	const handleListSelection = (listId) => {
		const selectedList = groceryLists.find((list) => list.id === listId);
		setCurrentListId(listId);
		setCurrentListItems(JSON.parse(selectedList.items) || []);
	};

	if (!userName) {
		return <p className="text-center text-white">Loading...</p>;
	}

	return (
		<div className="p-5 flex flex-col">
			{/* Welcome Message */}
			<div className="text-center">
				<h1 className="text-2xl font-bold">Welcome, {userName}</h1>
			</div>

			{/* Main Content */}
			<div className="flex mt-5">
				{/* Spending Trends Section */}
				<div className="flex-1 mr-5 overflow-hidden">
					<h2 className="block text-xl font-semibold hover:underline mb-4">
						Spending Trends
					</h2>
					<div className="overflow-y-auto h-[calc(100vh-10rem)] p-2 border rounded-lg">
						<ChartBar />
						<LineChart />
						<PieChart />
					</div>
				</div>

				{/* Grocery List Section */}
				<div className="flex-1 flex flex-col">
					<h2 className="block text-xl font-semibold hover:underline mb-4">
						Grocery List
					</h2>

					{/* Dropdown to Select Lists */}
					<div className="mb-4">
						<Dropdown>
							<DropdownTrigger>
								<Button>
									{groceryLists.find(
										(list) => list.id === currentListId
									)?.name || "Select List"}
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								onAction={(key) =>
									handleListSelection(parseInt(key))
								}
							>
								{groceryLists.map((list) => (
									<DropdownItem key={list.id}>
										{list.name}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					</div>

					{/* Scrollable Grocery List */}
					<div className="overflow-y-auto h-[calc(100vh-10rem)] p-2 border rounded-lg">
						{currentListItems.length === 0 ? (
							<p className="text-center">
								No items in this list.
							</p>
						) : (
							<ul>
								{currentListItems.map((item, index) => (
									<li key={index} className="mb-5">
										<ItemCard
											itemName={item.name}
											quantity={item.quantity}
										/>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
