import React, { useState } from 'react';
import { Card3D } from '../components/Card3D';
import { VisaLogo, MastercardLogo } from '../components/CardVisuals';
import { CreditCard, Search, ArrowRight, ShieldCheck, Truck, Layers, Lock, Cpu, CheckCircle2 } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, state?: any) => void;
  onTrackLookup?: (trackingId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onTrackLookup }) => {
  const [demoNetwork, setDemoNetwork] = useState<'visa' | 'mastercard'>('visa');
  const [quickTrackingId, setQuickTrackingId] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackingId.trim()) {
      onNavigate('track', { trackingId: quickTrackingId.trim() });
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col: Hero copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                Personalize Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
                  Universal Sports Tip
                </span> <br />
                Physical Card
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Configure your personalized cardholder pass, explore a real-time interactive 3D preview, review transparent service pricing, and track verified high-spec physical production from engraving to your doorstep.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('request')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Request a Card</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('track')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Track Delivery</span>
                </button>
              </div>

              {/* Quick Tracking Search Bar */}
              <div className="pt-4 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleQuickTrack} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 focus-within:border-blue-500/80 transition-colors">
                  <Search className="w-4 h-4 text-slate-500 ml-2.5 shrink-0" />
                  <input
                    type="text"
                    value={quickTrackingId}
                    onChange={(e) => setQuickTrackingId(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. UST-TRK-8F42K9)"
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-1"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shrink-0 cursor-pointer"
                  >
                    Track
                  </button>
                </form>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-900 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-heading">CR80</div>
                  <div className="text-[11px] text-slate-400">ISO/IEC Standard Form</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-heading">100%</div>
                  <div className="text-[11px] text-slate-400">Transparent Pricing</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-heading">End-to-End</div>
                  <div className="text-[11px] text-slate-400">Shipment Milestones</div>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive 3D Card Preview with Demo Specimen */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#070e24] border border-blue-900/40 shadow-2xl relative">
                {/* Demo Card Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-slate-300">Live 3D Card Preview</span>
                  </div>

                  {/* Network Toggle for Hero Demo */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDemoNetwork('visa')}
                      className={`px-2 py-1 rounded text-[11px] transition-all cursor-pointer ${
                        demoNetwork === 'visa' ? 'bg-blue-600/40 text-white border border-blue-500/50' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <VisaLogo className="h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoNetwork('mastercard')}
                      className={`px-2 py-1 rounded text-[11px] transition-all cursor-pointer ${
                        demoNetwork === 'mastercard' ? 'bg-blue-600/40 text-white border border-blue-500/50' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MastercardLogo className="h-4" />
                    </button>
                  </div>
                </div>

                {/* 3D Card Interactive Preview with Authoritative Master Blue Artwork & Demo Name Jason Aaron */}
                <Card3D
                  cardholderName="Jason Aaron"
                  network={demoNetwork}
                  simulatedNumber={demoNetwork === 'visa' ? '4892 8492 1039 9210' : '5412 8492 1039 8201'}
                  simulatedExpiry="12/29"
                />

                <div className="mt-4 text-center">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tilt to reflect light • Tap card or button to inspect reverse side</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">
              Simple 5-Step Process
            </h2>
            <p className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
              How Universal Sports Tip Operates
            </p>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              From authorized card network selection to secure doorstep courier delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-blue-600/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-heading font-bold text-white text-base">Select Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose between authentic Visa and Mastercard network formats with natural proportions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-blue-600/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-heading font-bold text-white text-base">Complete Form</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide legal personal identity and accurate physical delivery dispatch coordinates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-blue-600/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-heading font-bold text-white text-base">Review Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Audit transparent, itemized production and shipping charges with zero hidden clearances.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-blue-600/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-heading font-bold text-white text-base">Complete Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Finalize order through verified settlement gateways with immutable transaction records.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 hover:border-blue-600/40 transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                05
              </div>
              <h3 className="font-heading font-bold text-white text-base">Track Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor live chronological milestone events until secure tamper-evident receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM KEY FEATURES */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Personalized 3D Card Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time responsive updates instantly mirror your cardholder name onto the authoritative master blue abstract artwork template with authentic silver contactless EMV styling.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Transparent Service Charges
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear, itemized service quotes loaded directly from our backend database. No arbitrary deposit conditions or misleading payout unlock promises.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Milestone Tracking System
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unique tracking references verify actual production checkpoints: application vetted, precision printed, dispatched, sorting hub arrival, and delivery confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950 via-[#071333] to-slate-950 border border-blue-800/40 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Ready to Order Your Personalized Card?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light">
              Submit your request in minutes. Monitor production status and follow your courier dispatch package in real time.
            </p>
          </div>
          <button
            onClick={() => onNavigate('request')}
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-600/30 shrink-0 cursor-pointer"
          >
            Start Card Application
          </button>
        </div>
      </section>
    </div>
  );
};
