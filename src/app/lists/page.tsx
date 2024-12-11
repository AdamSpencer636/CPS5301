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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Checkbox,
} from "@nextui-org/react";
import { supabase } from "../../util/supabase/supabaseClient";

const GroceryListPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [lists, setLists] = useState([]); // All grocery lists
  const [currentListId, setCurrentListId] = useState(null); // Active list ID
  const [currentListItems, setCurrentListItems] = useState([]); // Items in active list
  const [newItem, setNewItem] = useState({ name: "", quantity: "" }); // For adding items
  const [editingIndex, setEditingIndex] = useState(null); // Index of item being edited
  const [editingItem, setEditingItem] = useState(null); // Item currently being edited
  const [newListName, setNewListName] = useState(""); // New list name for renaming or creating a list
  const [loading, setLoading] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false); // Modal for creating a new list

  useEffect(() => {
    fetchLists(); // Fetch all grocery lists on load
  }, []);

  // Fetch all lists from Supabase
  const fetchLists = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("grocery_lists").select("*");

    if (error) {
      console.error("Error fetching lists:", error);
    } else {
      setLists(data);
      if (data.length > 0) {
        setCurrentListId(data[0].id); // Set the first list as default
        setCurrentListItems(JSON.parse(data[0].items) || []);
      }
    }
    setLoading(false);
  };

  // Fetch items for the selected list
  const fetchListItems = async (listId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("items")
      .eq("id", listId)
      .single();

    if (error) {
      console.error("Error fetching list items:", error);
    } else {
      setCurrentListId(listId);
      setCurrentListItems(JSON.parse(data.items) || []);
    }
    setLoading(false);
  };

  // Handle adding a new list
  const handleAddList = async () => {
    const { data, error } = await supabase
      .from("grocery_lists")
      .insert({
        name: newListName || `List ${lists.length + 1}`,
        items: JSON.stringify([]),
      })
      .select("*");

    if (error) {
      console.error("Error adding list:", error);
    } else {
      setLists([...lists, ...data]);
      setCurrentListId(data[0].id); // Set the new list as active
      setCurrentListItems([]);
      setNewListName(""); // Reset the input field
      setIsListModalOpen(false); // Close modal
    }
  };

  // Handle renaming a list
  const handleRenameList = async () => {
    const { error } = await supabase
      .from("grocery_lists")
      .update({ name: newListName })
      .eq("id", currentListId);

    if (error) {
      console.error("Error renaming list:", error);
    } else {
      const updatedLists = lists.map((list) =>
        list.id === currentListId ? { ...list, name: newListName } : list
      );
      setLists(updatedLists);
      setNewListName("");
    }
  };

  // Handle adding an item to the current list
  const handleAddItem = async () => {
    const updatedItems = [...currentListItems, newItem];
    const { error } = await supabase
      .from("grocery_lists")
      .update({ items: JSON.stringify(updatedItems) })
      .eq("id", currentListId);

    if (error) {
      console.error("Error adding item:", error);
    } else {
      setCurrentListItems(updatedItems);
      setNewItem({ name: "", quantity: "" });
      onOpenChange(false); // Close modal
    }
  };

  // Handle editing an item in the current list
  const handleEditItem = async (index) => {
    const updatedItems = [...currentListItems];
    updatedItems[index] = editingItem;

    const { error } = await supabase
      .from("grocery_lists")
      .update({ items: JSON.stringify(updatedItems) })
      .eq("id", currentListId);

    if (error) {
      console.error("Error editing item:", error);
    } else {
      setCurrentListItems(updatedItems);
      setEditingIndex(null); // Exit edit mode
    }
  };

  // Handle deleting an item from the current list
  const handleDeleteItem = async (index) => {
    const updatedItems = currentListItems.filter((_, i) => i !== index);

    const { error } = await supabase
      .from("grocery_lists")
      .update({ items: JSON.stringify(updatedItems) })
      .eq("id", currentListId);

    if (error) {
      console.error("Error deleting item:", error);
    } else {
      setCurrentListItems(updatedItems);
    }
  };

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-5">Grocery Lists</h1>

      {/* Dropdown for selecting lists */}
      <div className="flex justify-between items-center mb-5">
        <Dropdown>
          <DropdownTrigger>
            <Button>
              {lists.find((list) => list.id === currentListId)?.name ||
                "Select List"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu onAction={(key) => fetchListItems(parseInt(key))}>
            {lists.map((list) => (
              <DropdownItem key={list.id}>{list.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Button color="primary" onPress={() => setIsListModalOpen(true)}>
          Add List
        </Button>
        <Button
          color="secondary"
          onPress={() =>
            setNewListName(
              lists.find((list) => list.id === currentListId)?.name || ""
            )
          }
        >
          Rename List
        </Button>
      </div>

      {/* Grocery List Table */}
      <div className="mb-5">
        <Button color="primary" onPress={onOpen}>
          Add Item
        </Button>
      </div>

      {currentListItems.length === 0 ? (
        <div className="flex justify-center">
          <p>No items in the list.</p>
        </div>
      ) : (
        <Table
          aria-label="Grocery List"
          className="bg-gray-800 text-white rounded-lg"
        >
          <TableHeader>
            <TableColumn>Select</TableColumn>
            <TableColumn>Item Name</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {currentListItems.map((item, index) => (
				<TableRow key={index}>
					<TableCell>
						<Checkbox />
					</TableCell>
                {/* Editable Item Name */}
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>

                {/* Editable Quantity */}
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          quantity: parseInt(e.target.value),
                        })
                      }
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  {editingIndex === index ? (
                    <Button
                      size="sm"
                      color="success"
                      onPress={() => handleEditItem(index)}
                    >
                      Save
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        color="secondary"
                        onPress={() => {
                          setEditingIndex(index);
                          setEditingItem(item);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => handleDeleteItem(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2>Add Item</h2>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Item Name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleAddItem}>
                  Add
                </Button>
                <Button color="danger" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add List Modal */}
      <Modal isOpen={isListModalOpen} onOpenChange={setIsListModalOpen}>
        <ModalContent>
          <ModalHeader>
            <h2>Create New List</h2>
          </ModalHeader>
          <ModalBody>
            <Input
              label="List Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleAddList}>
              Create
            </Button>
            <Button color="danger" onPress={() => setIsListModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GroceryListPage;
