"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../i18n/I18nProvider';
import LanguageSelector from './LanguageSelector';

export default function SiteHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, isOpen, toggleCart } = useCart();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = isMounted 
    ? items.reduce((total, item) => total, 0)
    : 0;

  const categories = [
    { name: 'Galerie', slug: 'galerie' },
    { name: 'Maison Jardin', slug: 'maison-jardin' },
    { name: 'Sculpture', slug: 'sculpture' },
    { name: 'Impression 3D', slug: 'impression-3d' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <header className="headerGradient border-b border-[#cfc9c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Espace vide pour éviter les sauts de mise en page */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="headerGradient border-b border-[#cfc9c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
          <img
            src="/images/logo.png" alt="Inukshuk" className="h-10 w-auto"
          />
          <Link 
            href="/" 
            className="h-14 flex items-center px-4 text-2xl lg:text-3xl font-bold text-black hover:bg-white hover:text-[var(--leaf)] transition-colors whitespace-nowrap mouly-font"
          >
            Benito Pepito
          </Link>
          </div>

          <div className="flex items-center space-x-1 h-16">
            <LanguageSelector />
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-16 w-16 text-black hover:bg-white flex items-center justify-center"
              aria-label="Open menu"
            >
              ☰
            </button>
            {/* <Link href="/products" className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] flex items-center justify-center transition-colors rounded-none overflow-hidden" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link> */}
            <button 
              onClick={toggleCart} 
              className="h-16 w-16 text-black hover:bg-white hover:text-[var(--leaf)] relative flex items-center justify-center transition-colors rounded-none overflow-hidden cursor-pointer"
              aria-label="Cart"
            >
              {/* Simple bag icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8V6a3 3 0 116 0v2" />
              </svg>
              {itemCount > 0 && (
                <span className="pointer-events-none absolute top-1 right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="block py-2 hover:text-[var(--leaf)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}

              <Link
                href="/about"
                className="block py-2 hover:text-[var(--leaf)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.about')}
              </Link>

              <Link
                href="/contact"
                className="block py-2 hover:text-[var(--leaf)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
