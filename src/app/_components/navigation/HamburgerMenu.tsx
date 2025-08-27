'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface MenuItem {
  icon: string;
  title: string;
  href: string;
  roles?: string[];
}

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  
  const menuItems: MenuItem[] = [
    {
      icon: '🏠',
      title: 'דף הבית',
      href: '/dashboard',
    },
    {
      icon: '📋',
      title: 'ניהול אילוצים',
      href: '/constraints',
    },
    // More items will be added later
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(session?.user?.role || '')
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="relative z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
        aria-label="פתח תפריט"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div
            className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 transform ${
              isOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <div
            className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <div
            className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1 transform ${
              isOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
          />
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-lg text-purple-600 font-bold">ס</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sigalit</h2>
                <p className="text-sm text-blue-100">מערכת ניהול שיבוצים</p>
              </div>
            </div>
            <button
              onClick={toggleMenu}
              className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user.role === 'ADMIN' ? 'מנהל מערכת' : 
                   session.user.role === 'COORDINATOR' ? 'רכז' : 'מדריך'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={toggleMenu}>
                  <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                      {item.title}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Sigalit v1.0 - מערכת ניהול שיבוצים
          </p>
        </div>
      </div>
    </>
  );
}