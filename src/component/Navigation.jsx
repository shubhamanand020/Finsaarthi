import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <img
            src="https://media1.thehungryjpeg.com/thumbs2/ori_3656790_lz68k1yb3pzbslhunbx7ssq37zdzszv4grwq4t8d_monogram-fs-logo-design.jpg"  // <-- your online logo link
            alt="FinSaarthi Logo"
            className="h-8 w-8 object-contain"
          />

          <span className="text-2xl font-bold text-orange-600">
            FinSaarthi
          </span>
        </a>


        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">

          {/* PUBLIC LINK */}
          <a href="/" className="hover:text-orange-600 font-medium">Home</a>

          {/* STUDENT ONLY LINKS */}
          {user && user.role === "student" && (
            <>
              <a href="/scholarships" className="hover:text-orange-600 font-medium">
                Scholarships
              </a>

              <a href="/dashboard" className="hover:text-orange-600 font-medium">
                Dashboard
              </a>
            </>
          )}

          {/* ADMIN ONLY LINK */}
          {user && user.role === "admin" && (
            <>
              <a href="/admin" className="hover:text-orange-600 font-medium">
                Admin Panel
              </a>
            </>
          )}

          {/* PROFILE VISIBLE TO BOTH ADMIN + STUDENT */}
          {user && (
            <a href="/profile" className="hover:text-orange-600 font-medium">
              Profile
            </a>
          )}

          {/* AUTH BUTTONS */}
          {!user ? (
            <>
              <a href="/login" className="text-orange-600 font-medium">Login</a>
              <a
                href="/register"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium"
              >
                Register
              </a>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg px-4 py-4 space-y-4">

          <a href="/" className="block hover:text-orange-600 font-medium">
            Home
          </a>

          {/* STUDENT ONLY */}
          {user && user.role === "student" && (
            <>
              <a href="/scholarships" className="block hover:text-orange-600 font-medium">
                Scholarships
              </a>
              <a href="/dashboard" className="block hover:text-orange-600 font-medium">
                Dashboard
              </a>
            </>
          )}

          {/* ADMIN ONLY */}
          {user && user.role === "admin" && (
            <>
              <a href="/admin" className="block hover:text-orange-600 font-medium">
                Admin Panel
              </a>
            </>
          )}

          {/* PROFILE FOR BOTH */}
          {user && (
            <a href="/profile" className="block hover:text-orange-600 font-medium">
              Profile
            </a>
          )}

          {/* AUTH BUTTONS */}
          {!user ? (
            <>
              <a href="/login" className="block text-orange-600 font-medium">Login</a>
              <a
                href="/register"
                className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium"
              >
                Register
              </a>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 bg-gray-800 text-white rounded-lg font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
