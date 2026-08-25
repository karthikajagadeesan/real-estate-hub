'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Building2, PlusCircle, LogOut, Menu, X, FileText, Home, Search, AlertTriangle, Lock } from 'lucide-react';

/* ─────────────────────────────────────────
   Logout Confirmation Modal
───────────────────────────────────────── */
const LogoutConfirmModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  /* Backdrop */
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onClick={onCancel}
  >
    {/* Card — stop click-through */}
    <div
      className="relative w-full max-w-sm mx-4 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 p-6 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/20">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>

      {/* Text */}
      <h2 className="text-lg font-bold text-white text-center mb-1">Logout</h2>
      <p className="text-sm text-slate-400 text-center mb-6">
        Are you sure you want to log out of your account?
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02]"
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Navbar
───────────────────────────────────────── */
export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [restrictedNotice, setRestrictedNotice] = useState<{ open: boolean; linkName: string }>({
    open: false,
    linkName: '',
  });

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isRestricted = !user || isAuthPage;

  const handleRestrictedClick = (e: React.MouseEvent, linkName: string) => {
    if (isRestricted) {
      e.preventDefault();
      setRestrictedNotice({ open: true, linkName });
    }
  };

  const handleNavigateToAuth = (path: string) => {
    setRestrictedNotice({ open: false, linkName: '' });
    router.push(path);
  };

  // Helper: returns true if the given href matches the current path
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Desktop nav link classes
  const navLinkClass = (href: string) =>
    `flex items-center gap-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-white border-b-2 border-brand-500 pb-0.5'
        : 'text-slate-300 hover:text-white'
    }`;

  // Mobile nav link classes
  const mobileNavLinkClass = (href: string) =>
    `block py-2 font-medium transition-colors ${
      isActive(href) ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
    }`;

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setMobileMenuOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* ── Access Restricted Modal ── */}
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

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Brand Logo */}
            <div className="flex items-center gap-3 select-none">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 p-0.5 shadow-lg shadow-brand-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-brand-500" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold font-outfit text-white tracking-tight">
                  India<span className="text-gradient font-extrabold">Dits</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Premium Real Estate
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  <Link href="/" className={navLinkClass('/')}>
                    <Home className="w-4 h-4 text-brand-500" /> Home
                  </Link>
                  <Link href="/properties" onClick={(e) => handleRestrictedClick(e, 'Explore Properties')} className={navLinkClass('/properties')}>
                    <Search className="w-4 h-4 text-brand-500" /> Explore Properties
                  </Link>
                  <Link href="/api-docs" onClick={(e) => handleRestrictedClick(e, 'Launch OpenAPI Specs / API Docs')} className={`${navLinkClass('/api-docs')} ${isActive('/api-docs') ? '' : 'hover:text-accent-500'}`}>
                    <FileText className="w-4 h-4 text-accent-500" /> API Docs
                  </Link>

                  <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                    <Link
                      href="/dashboard?tab=listings"
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        isActive('/dashboard')
                          ? 'text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-600/20 hover:from-brand-500 hover:to-brand-600 hover:scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" /> Post Property
                    </Link>

                    <Link
                      href="/dashboard?tab=listings"
                      className="flex items-center gap-3 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                      title="View My Posted Listings & Dashboard"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-white leading-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                      </div>
                    </Link>

                    {/* Desktop logout — opens modal */}
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      pathname === '/login'
                        ? 'text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-600/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      pathname === '/register'
                        ? 'text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-600/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-800 bg-slate-950 px-4 pt-4 pb-6 space-y-4">
            {user ? (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/')}>Home</Link>
                <Link href="/properties" onClick={(e) => { setMobileMenuOpen(false); handleRestrictedClick(e, 'Explore Properties'); }} className={mobileNavLinkClass('/properties')}>Explore Properties</Link>
                <Link href="/api-docs" onClick={(e) => { setMobileMenuOpen(false); handleRestrictedClick(e, 'Launch OpenAPI Specs / API Docs'); }} className={`${mobileNavLinkClass('/api-docs')} ${isActive('/api-docs') ? 'text-accent-400' : 'text-accent-400 hover:text-accent-300'}`}>API Docs (Swagger UI Server)</Link>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="text-xs text-slate-400">Signed in as <span className="text-white font-bold">{user.name}</span></div>
                  <Link href="/dashboard?tab=listings" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 bg-slate-900 text-white font-semibold rounded-lg">My Posted Listings</Link>
                  <Link href="/dashboard?tab=inquiries" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 bg-slate-900 text-white font-semibold rounded-lg">Leads Received</Link>
                  <Link href="/dashboard?tab=create" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2.5 bg-brand-600 text-white font-semibold rounded-lg">+ Post Property Form</Link>
                  {/* Mobile logout — opens modal */}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full text-left py-2 text-rose-400 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-center py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    pathname === '/login'
                      ? 'text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-center py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    pathname === '/register'
                      ? 'text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
