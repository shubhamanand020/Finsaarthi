import React from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Navigation Bar */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-grow pt-4 pb-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
