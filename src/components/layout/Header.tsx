import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Dumbbell, Menu, X, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Diet Plan', key: 'diet' },
    { name: 'Workout', key: 'workout' },
    { name: 'Progress', key: 'progress' },
    { name: 'Profile', key: 'profile' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                  AI Fitness
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden items-center space-x-4 md:flex">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 transition-colors hover:text-blue-600"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      onPageChange('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onPageChange(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                    currentPage === item.key
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="mt-3 border-t border-gray-200 pt-3">
                <button
                  onClick={() => {
                    onPageChange('profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                >
                  <User className="mr-2 h-5 w-5" />
                  Profile Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}