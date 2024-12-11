'use client';
import { Button, Card } from '@nextui-org/react';
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import Link from 'next/link';

const LandingPage = () => {
  const testimonials = [
    {
      quote:
        "Grocery Tracker has completely transformed how I manage my shopping. I never forget an item anymore, and the inventory tracking is a lifesaver!",
      name: "Jane Doe",
      title: "Busy Mom of Three",
    },
    {
      quote:
        "As a restaurant owner, staying on top of inventory used to be a nightmare. Grocery Tracker has made it simple, efficient, and stress-free.",
      name: "John Smith",
      title: "Restaurant Owner",
    },
    {
      quote:
        "I love how intuitive and user-friendly Grocery Tracker is. The analytics feature has helped me save money by tracking spending trends.",
      name: "Emily Johnson",
      title: "Budget-Conscious Shopper",
    },
    {
      quote:
        "I never knew grocery shopping could be this organized! The shared lists feature is perfect for coordinating with my roommates.",
      name: "Michael Brown",
      title: "College Student",
    },
    {
      quote:
        "Grocery Tracker is a must-have for any household. It helps us manage our groceries efficiently, and the low-stock alerts are a game changer.",
      name: "Sarah Lee",
      title: "Home Organizer",
    },
    {
      quote:
        "The integration of inventory and shopping lists is genius. It's like having a personal assistant for my groceries.",
      name: "David Carter",
      title: "Software Engineer",
    },
    {
      quote:
        "Running a small grocery store is easier than ever with Grocery Tracker. It helps me monitor stock levels and avoid over-ordering.",
      name: "Linda Martinez",
      title: "Small Business Owner",
    },
    {
      quote:
        "Thanks to Grocery Tracker, I’ve reduced food waste by keeping track of what I already have. Highly recommend it to anyone!",
      name: "Chris Wilson",
      title: "Eco-Friendly Advocate",
    },
    {
      quote:
        "This app is incredible! It’s helped me streamline my shopping and keep track of everything I need for my family.",
      name: "Amanda White",
      title: "Full-Time Parent",
    },
    {
      quote:
        "The low-stock notifications have saved me so much time. I never run out of essentials anymore. Highly recommend Grocery Tracker!",
      name: "Paul Adams",
      title: "Frequent Shopper",
    },
  ];

  return (
    <div className="p-5 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-screen-lg text-center py-10">
        <h1 className="text-4xl font-bold mb-5">
          Welcome to <span className="text-primary-500">Grocery Tracker</span>
        </h1>
        <p className="text-xl mb-8">
          Simplify your grocery shopping and inventory management with our
          powerful app. Track your items, manage your stock, and make shopping
          stress-free.
        </p>
        <div className="overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
        <Link href="/dashboard">
          <Button color="primary" size="lg" className="mt-5">
            Get Started
          </Button>
        </Link>
      </section>

      {/* About Section */}
      <section className="w-full max-w-screen-lg mt-10">
        <Card className="bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-5">
            What is Grocery Tracker?
          </h2>
          <p className="text-lg">
            Grocery Tracker is an intuitive application designed to streamline
            grocery shopping and inventory management. Whether you're a busy
            household or a small business owner, our app helps you:
          </p>
          <ul className="list-disc list-inside mt-5 text-lg">
            <li>Keep track of your inventory levels in real-time.</li>
            <li>Create, update, and manage grocery lists effortlessly.</li>
            <li>
              View detailed analytics about your spending and stock trends.
            </li>
            <li>
              Collaborate with family or team members to make shopping seamless.
            </li>
          </ul>
          <p className="mt-5">
            Start using Grocery Tracker today and make managing groceries a
            breeze!
          </p>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-screen-lg text-center mt-10">
        <Card className="bg-gray-800 p-8">
          <h2 className="text-2xl font-semibold mb-5">Get Started Now</h2>
          <p className="text-lg mb-5">
            Join thousands of users who are simplifying their grocery
            experience. Sign up today and take control of your shopping and
            inventory!
          </p>
          <Link href="/dashboard">
            <Button color="primary" size="lg">
              Sign Up Now
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
};

export default LandingPage;
