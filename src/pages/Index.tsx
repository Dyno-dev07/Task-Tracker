"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // Import PageTransitionWrapper

const Index = () => {
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Your Task Tracker!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Get started by signing up or logging in.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
          </div>
        </div>
        <MadeWithDyad />
      </div>
    </PageTransitionWrapper>
  );
};

export default Index;