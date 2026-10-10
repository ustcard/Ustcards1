import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { RequestCardPage } from './pages/RequestCardPage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { TrackingPage } from './pages/TrackingPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'request' | 'confirmation' | 'track' | 'dashboard' | 'admin'>('home');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [submittedRequestData, setSubmittedRequestData] = useState<any | null>(null);
  const [trackingLookupId, setTrackingLookupId] = useState<string>('');

  // Check URL path or hash on load
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // Check localStorage for saved session
    const savedUser = localStorage.getItem('ust_user');
    let loadedUser: any = null;
    if (savedUser) {
      try {
        loadedUser = JSON.parse(savedUser);
        setCurrentUser(loadedUser);
      } catch (e) {
        console.error(e);
      }
    }

    if (path === '/admin' || hash === '#admin') {
      const isAdmin = loadedUser && (loadedUser.role === 'super_admin' || loadedUser.role === 'ops_admin' || loadedUser.role === 'support_agent');
      if (isAdmin) {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
        setAuthInitialMode('login');
        setAuthModalOpen(true);
      }
    } else if (path === '/track' || hash === '#track') {
      setActiveTab('track');
    } else if (path === '/request' || hash === '#request') {
      setActiveTab('request');
    }
  }, []);

  // Sync browser URL history without page reload
  const navigateTo = (tab: string, state?: any) => {
    if (tab === 'track' && state?.trackingId) {
      setTrackingLookupId(state.trackingId);
    }
    if (tab === 'confirmation' && state) {
      setSubmittedRequestData(state);
    }

    setActiveTab(tab as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (tab === 'track') {
      window.history.pushState({}, '', '/track');
    } else if (tab === 'request') {
      window.history.pushState({}, '', '/request');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('ust_user', JSON.stringify(user));
    localStorage.setItem('ust_token', token);

    // If user has administrative role, automatically navigate directly to admin dashboard
    if (user.role === 'super_admin' || user.role === 'ops_admin' || user.role === 'support_agent') {
      setActiveTab('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      setActiveTab('dashboard');
      window.history.pushState({}, '', '/');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ust_user');
    localStorage.removeItem('ust_token');
    setActiveTab('home');
    window.history.pushState({}, '', '/');
  };

  const handleRequestCreated = (data: { request: any; address: any; quote: any }) => {
    setSubmittedRequestData(data);
    setActiveTab('confirmation');
  };

  // If on admin tab and logged in as admin, render Admin Dashboard
  if (activeTab === 'admin') {
    const isAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'ops_admin' || currentUser.role === 'support_agent');

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between">
          <Navbar
            activeTab="home"
            setActiveTab={navigateTo}
            currentUser={currentUser}
            onOpenAuth={() => {
              setAuthInitialMode('login');
              setAuthModalOpen(true);
            }}
            onLogout={handleLogout}
          />

          <main className="max-w-md w-full mx-auto p-6 space-y-6 text-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-2xl text-white">
                Sign In Required
              </h1>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Please sign in with your credentials to access your account.
              </p>
            </div>

            <button
              onClick={() => {
                setAuthInitialMode('login');
                setAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Sign In
            </button>
          </main>

          <Footer onNavigate={navigateTo} />

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
            initialMode={authInitialMode}
          />
        </div>
      );
    }

    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onExitAdmin={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Public Header with zero visible admin links */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onTrackLookup={(id) => navigateTo('track', { trackingId: id })}
          />
        )}

        {activeTab === 'request' && (
          <RequestCardPage
            currentUser={currentUser}
            onSuccess={handleRequestCreated}
          />
        )}

        {activeTab === 'confirmation' && (
          <PaymentConfirmationPage
            requestData={submittedRequestData}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'track' && (
          <TrackingPage initialTrackingId={trackingLookupId} />
        )}

        {activeTab === 'dashboard' && (
          <CustomerDashboardPage
            currentUser={currentUser}
            onNavigate={navigateTo}
            onOpenAuth={() => {
              setAuthInitialMode('login');
              setAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Global Public Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Unified Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />
    </div>
  );
}
