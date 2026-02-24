import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://t4.ftcdn.net/jpg/04/30/99/51/360_F_430995143_Y8xc25yIRX1Q1X6KOdEBLWxuNV4f8I9X.jpg"
            alt="FinSaarthi Logo"
            className="h-8 w-8 object-contain"
          />

          <span className="text-2xl font-bold text-orange-600">
            FinSaarthi
          </span>
        </Link>


        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">

          {/* PUBLIC LINK */}
          <Link to="/" className="hover:text-orange-600 font-medium">Home</Link>

          {/* STUDENT ONLY LINKS */}
          {user && user.role === "student" && (
            <>
              <Link to="/scholarships" className="hover:text-orange-600 font-medium">
                Scholarships
              </Link>

              <Link to="/dashboard" className="hover:text-orange-600 font-medium">
                Dashboard
              </Link>
            </>
          )}

          {/* ADMIN ONLY LINK */}
          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="hover:text-orange-600 font-medium">
                Admin Panel
              </Link>
            </>
          )}

          {/* PROFILE VISIBLE TO BOTH ADMIN + STUDENT */}
          {user && (
            <Link to="/profile" className="hover:text-orange-600 font-medium">
              Profile
            </Link>
          )}

          {/* AUTH BUTTONS */}
          {!user ? (
            <>
              <Link to="/login" className="text-orange-600 font-medium">Login</Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium"
              >
                Register
              </Link>
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

          <Link to="/" className="block hover:text-orange-600 font-medium">
            Home
          </Link>

          {/* STUDENT ONLY */}
          {user && user.role === "student" && (
            <>
              <Link to="/scholarships" className="block hover:text-orange-600 font-medium">
                Scholarships
              </Link>
              <Link to="/dashboard" className="block hover:text-orange-600 font-medium">
                Dashboard
              </Link>
            </>
          )}

          {/* ADMIN ONLY */}
          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="block hover:text-orange-600 font-medium">
                Admin Panel
              </Link>
            </>
          )}

          {/* PROFILE FOR BOTH */}
          {user && (
            <Link to="/profile" className="block hover:text-orange-600 font-medium">
              Profile
            </Link>
          )}

          {/* AUTH BUTTONS */}
          {!user ? (
            <>
              <Link to="/login" className="block text-orange-600 font-medium">Login</Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium"
              >
                Register
              </Link>
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