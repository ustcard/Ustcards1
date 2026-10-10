import React, { useState } from 'react';
import { Shield, Mail, Phone, Lock, FileText, CheckCircle2, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <footer className="bg-[#02050f] border-t border-blue-950/60 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-white text-base tracking-tight">
                UNIVERSAL <span className="text-blue-500">SPORTS TIP</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium physical sports pass personalization, precision micro-manufacturing, and end-to-end milestone logistics.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Tamper-evident verification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Homepage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('request')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Request a Card
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Track Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Customer Account
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
              Policies & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('refund')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('disclosure')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Card Service Disclosures
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
              Customer Support
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@universalsportstip.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+1 800-555-0199</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Operating Hours: Monday – Friday, 08:00 – 18:00 EST
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Service Disclosure Notice */}
        <div className="mt-8 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Service Scope & Financial Transparency Disclosure
          </p>
          <p>
            Universal Sports Tip provides bespoke personalization, physical engraving, and logistics fulfillment services for sports tip membership cards.
            Selecting a card network and completing personalization configures a customized membership card preview and production request.
            Universal Sports Tip does not issue line-of-credit banking services or clear financial payouts. All service charges are transparently listed prior to payment.
          </p>
        </div>

        {/* Copyright & Staff Portal */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Universal Sports Tip. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              Verified Production Pipeline
            </span>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0f1d] border border-blue-900/50 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-white">
                {activeModal === 'terms' && 'Terms and Conditions'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'refund' && 'Refund and Cancellation Policy'}
                {activeModal === 'disclosure' && 'Card-Service Disclosures'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>1. Agreement to Terms:</strong> By accessing Universal Sports Tip and submitting a card personalization request, you agree to comply with and be bound by these Terms and Conditions.
                  </p>
                  <p>
                    <strong>2. Nature of Service:</strong> Universal Sports Tip manufactures and fulfills personalized physical membership specimen cards. Applications are reviewed by our operations desk prior to production.
                  </p>
                  <p>
                    <strong>3. Accuracy of Customer Data:</strong> Customers are responsible for verifying that the full legal name, cardholder name, and delivery address provided during the request process are accurate.
                  </p>
                  <p>
                    <strong>4. Intellectual Property:</strong> Master card artwork templates, trademarks, and network brand representations are used strictly in compliance with established brand identity guidelines.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>1. Information Collection:</strong> We collect only the personal information required to review, manufacture, and deliver your card request (name, delivery address, contact email, and telephone number).
                  </p>
                  <p>
                    <strong>2. Use of Information:</strong> Personal data is strictly used for order validation, physical card printing, and courier tracking updates. We do not sell or monetize personal customer records.
                  </p>
                  <p>
                    <strong>3. Access Controls:</strong> Customer records are strictly isolated. Customers cannot access records of any other user. Administrative operations are tracked in tamper-resistant audit logs.
                  </p>
                  <p>
                    <strong>4. Security:</strong> All data transmissions are protected via modern SSL/TLS encryption protocols.
                  </p>
                </>
              )}

              {activeModal === 'refund' && (
                <>
                  <p>
                    <strong>1. Transparent Pricing:</strong> All service charges (card production, delivery, maintenance, tracking) are itemized transparently before payment.
                  </p>
                  <p>
                    <strong>2. Cancellation Prior to Production:</strong> Requests cancelled while in "Pending Review" status qualify for a 100% full refund to the original payment method.
                  </p>
                  <p>
                    <strong>3. Rejection by Operations:</strong> If an application is rejected during review, any fees collected are automatically queued for refund within 3 business days.
                  </p>
                  <p>
                    <strong>4. Custom Manufacturing:</strong> Once physical card engraving and micro-printing have commenced, production costs are non-refundable, though undelivered shipments remain eligible for courier replacement.
                  </p>
                </>
              )}

              {activeModal === 'disclosure' && (
                <>
                  <p>
                    <strong>1. Card Service Disclosures:</strong> The Universal Sports Tip platform facilitates custom physical card production and shipment monitoring.
                  </p>
                  <p>
                    <strong>2. No Financial Payouts:</strong> Ordinary card service fees are strictly manufacturing and logistics charges. They do not constitute clearance deposits to unlock financial payouts or lottery prizes.
                  </p>
                  <p>
                    <strong>3. Specimen Representation:</strong> The on-screen 3D interactive card preview and demo numbers are visual placeholders engineered to help customers visualize physical dimensions and typography.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
