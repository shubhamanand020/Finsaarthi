import React from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-base)', transition: 'background 0.35s ease' }}>

      {/* Navigation Bar */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-grow pb-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
