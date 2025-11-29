import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Navigation } from './Navigation';

export const Layout = ({ children }) => {
  const { user } = useAuth();
  const { getUserById } = useLocalStorage();

  const currentUser = user ? getUserById(user.id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pb-16">
        {children}
      </main>
      {user && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex items-center space-x-3 max-w-xs">
          {currentUser?.photo ? (
            <img
              src={currentUser.photo}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};
