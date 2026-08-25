'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Building2, Zap, Lock, X } from 'lucide-react';

export const Footer = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [restrictedNotice, setRestrictedNotice] = useState<{ open: boolean; linkName: string }>({
    open: false,
    linkName: '',
  });

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isRestricted = !user || isAuthPage;

  const handleLinkClick = (e: React.MouseEvent, href: string, linkName: string) => {
    if (isRestricted) {
      e.preventDefault();
      setRestrictedNotice({ open: true, linkName });
    }
  };

  const handleNavigateToAuth = (path: string) => {
    setRestrictedNotice({ open: false, linkName: '' });
    router.push(path);
  };

  return (
    <>
      {/* Access Restricted Notification Modal */}
      {restrictedNotice.open && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setRestrictedNotice({ open: false, linkName: '' })}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/80 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRestrictedNotice({ open: false, linkName: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Access Restricted</h3>
                <p className="text-xs text-slate-400">Authentication Required</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p className="font-medium">
                You must be logged in or registered to access <strong className="text-white font-semibold">{restrictedNotice.linkName}</strong>.
              </p>
              <p className="text-slate-400">
                Please log in to your account or create a free account first.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleNavigateToAuth('/login')}
                className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all text-center"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigateToAuth('/register')}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all text-center"
              >
                Register Account
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            <div className="space-y-4">
              <Link
                href="/"
                onClick={(e) => handleLinkClick(e, '/', 'Home')}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold font-outfit text-white">
                  India<span className="text-brand-500">Dits</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed">
                India's premier real-estate discovery platform for verified apartments, villas, plots, and commercial spaces. Engineered for high performance across 50,000+ listings.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/properties"
                    onClick={(e) => handleLinkClick(e, '/properties', 'Explore All Listings')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Explore All Listings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?listingType=SELL"
                    onClick={(e) => handleLinkClick(e, '/properties?listingType=SELL', 'Buy Property')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Buy Property
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?listingType=RENT"
                    onClick={(e) => handleLinkClick(e, '/properties?listingType=RENT', 'Rent Property')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Rent Property
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    onClick={(e) => handleLinkClick(e, '/dashboard', 'Post Free Property Ad')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Post Free Property Ad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Top Cities</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/properties?city=Mumbai"
                    onClick={(e) => handleLinkClick(e, '/properties?city=Mumbai', 'Mumbai Real Estate')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Mumbai Real Estate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?city=Bengaluru"
                    onClick={(e) => handleLinkClick(e, '/properties?city=Bengaluru', 'Bengaluru Tech Hubs')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Bengaluru Tech Hubs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?city=Delhi"
                    onClick={(e) => handleLinkClick(e, '/properties?city=Delhi', 'Delhi NCR Properties')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Delhi NCR Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?city=Hyderabad"
                    onClick={(e) => handleLinkClick(e, '/properties?city=Hyderabad', 'Hyderabad Gachibowli')}
                    className="hover:text-brand-400 transition-colors"
                  >
                    Hyderabad Gachibowli
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Developer APIs</h4>
              <div className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <Zap className="w-4 h-4" /> Open API Spec Ready
                </div>
                <p className="text-[11px] text-slate-400">
                  Explore backend endpoints with interactive Swagger UI documentation.
                </p>
                <Link 
                  href="/api-docs"
                  onClick={(e) => handleLinkClick(e, '/api-docs', 'Launch OpenAPI Specs')}
                  className="inline-block px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-medium transition-colors"
                >
                  Launch OpenAPI Specs →
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} IndiaDits Platform. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Built with Next.js, Node.js & PostgreSQL</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
