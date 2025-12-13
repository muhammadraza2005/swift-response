'use client';

import { useState } from 'react';
import AuthButton from './AuthButton';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 mt-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
              SR
            </div>
            <h2 className="text-lg font-bold text-primary">Swift Response</h2>
          </div>

          {/* Navigation Links */}
          <nav className="mb-6">
            <ul className="space-y-4">
              <li>
                <a
                  href="/"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/requests/create"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Report Help
                </a>
              </li>
              <li>
                <a
                  href="/volunteer"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Volunteer
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Privacy
                </a>
              </li>
            </ul>
          </nav>

          {/* Auth Button */}
          <div className="pt-4 border-t border-gray-200">
            <AuthButton />
          </div>
        </div>
      </div>
    </>
  );
}
