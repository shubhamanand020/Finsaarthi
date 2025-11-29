import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Home, User, BookOpen, Settings, LogOut, CircleUser as UserCircle } from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = '/';
  };

  const NavLink = ({ href, icon, children, onClick }) => (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
        setIsOpen(false);
      }}
      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
    >
      {icon}
      <span>{children}</span>
    </a>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                FinSaarthi
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-orange-600 transition-colors">
              Home
            </a>

            <a href="/scholarships" className="text-gray-700 hover:text-orange-600 transition-colors">
              Scholarships
            </a>

            {user ? (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Dashboard
                </a>

                {user.role === 'admin' && (
                  <a href="/admin" className="text-gray-700 hover:text-orange-600 transition-colors">
                    Admin
                  </a>
                )}

                <a href="/profile" className="text-gray-700 hover:text-orange-600 transition-colors flex items-center">
                  <UserCircle className="w-4 h-4 mr-1" />
                  Profile
                </a>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink href="/" icon={<Home className="w-5 h-5" />}>
              Home
            </NavLink>

            <NavLink href="/scholarships" icon={<BookOpen className="w-5 h-5" />}>
              Scholarships
            </NavLink>

            {user ? (
              <>
                <NavLink href="/dashboard" icon={<User className="w-5 h-5" />}>
                  Dashboard
                </NavLink>

                {user.role === 'admin' && (
                  <NavLink href="/admin" icon={<Settings className="w-5 h-5" />}>
                    Admin
                  </NavLink>
                )}

                <NavLink href="#" icon={<LogOut className="w-5 h-5" />} onClick={handleLogout}>
                  Logout
                </NavLink>
              </>
            ) : (
              <NavLink href="/login" icon={<User className="w-5 h-5" />}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
