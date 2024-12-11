// components/Navbar.js
"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const AppNavbar = () => {
  const routes = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Inventory", path: "/inventory" },
    { name: "Spending", path: "/spending" },
    { name: "Carts", path: "/carts" },
    { name: "Grocery Lists", path: "/lists"}
  ];

  return (
    <Navbar className="h-[3rem]" isBordered>
      {/* Dropdown for Navigation on the Left */}
      <NavbarBrand>
        <Dropdown>
          <DropdownTrigger>
            <button
              className="text-white focus:outline-none"
              aria-label="Open Navigation"
            >
              ☰
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Navigation">
            {routes.map((route) => (
              <DropdownItem key={route.name} className="hover:text-blue-500">
                <Link href={route.path} className="block text-white">
                  {route.name}
                </Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </NavbarBrand>

      {/* Center Title */}
      <NavbarContent justify="center">
        <Link href={"/"}>
          <h1 className="text-xl font-bold text-white">Grocery Tracker</h1>
        </Link>
      </NavbarContent>

      {/* User Profile Button on the Right */}
      <NavbarContent justify="end">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </NavbarContent>
    </Navbar>
  );
};

export default AppNavbar;
