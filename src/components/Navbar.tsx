import React, { useState } from 'react';
import { CreditCard, Compass, Search, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#030712]/90 border-b border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex flex-col text-left group cursor-pointer"
        >
          <span className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
            UNIVERSAL <span className="text-blue-500 group-hover:text-blue-400 transition-colors">SPORTS TIP</span>
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase block font-mono -mt-0.5">
            PREMIUM SPORTS CARD PLATFORM
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav('home')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-white bg-blue-600/20 border border-blue-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('request')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'request'
                ? 'text-white bg-blue-600/20 border border-blue-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-400" />
            Request a Card
          </button>

          <button
            onClick={() => handleNav('track')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'track'
                ? 'text-white bg-blue-600/20 border border-blue-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            Track Delivery
          </button>

          {currentUser && (
            <button
              onClick={() => handleNav(currentUser.role !== 'customer' ? 'admin' : 'dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                (activeTab === 'dashboard' || activeTab === 'admin')
                  ? 'text-white bg-blue-600/20 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-400" />
              {currentUser.role !== 'customer' ? 'Admin Portal' : 'My Requests'}
            </button>
          )}
        </nav>

        {/* User Account Action */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav(currentUser.role !== 'customer' ? 'admin' : 'dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600/40 flex items-center justify-center text-[11px] font-bold text-blue-300">
                  {currentUser.full_name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[120px] truncate font-medium">{currentUser.full_name}</span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => handleNav('request')}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-500/40 cursor-pointer"
              >
                Request a Card
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-blue-900/40 bg-[#070d1e] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home' ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('request')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'request' ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              Request a Card
            </button>
            <button
              onClick={() => handleNav('track')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'track' ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-blue-400" />
              Track Delivery
            </button>
            {currentUser && (
              <button
                onClick={() => handleNav(currentUser.role !== 'customer' ? 'admin' : 'dashboard')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  (activeTab === 'dashboard' || activeTab === 'admin') ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-400" />
                {currentUser.role !== 'customer' ? 'Admin Portal' : 'Customer Account'}
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-900/60 text-xs text-rose-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full py-2.5 text-center text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('request')}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-md cursor-pointer"
                >
                  Request Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
