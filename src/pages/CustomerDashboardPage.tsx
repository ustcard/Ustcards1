import React, { useState, useEffect } from 'react';
import { Card3D } from '../components/Card3D';
import { CreditCard, Clock, Truck, ShieldCheck, Search, ChevronRight, X, AlertCircle, FileText, CheckCircle2, Mail, Eye } from 'lucide-react';
import { fetchCustomerData } from '../services/apiClient';

interface CustomerDashboardProps {
  currentUser: any;
  onNavigate: (tab: string, state?: any) => void;
  onOpenAuth: () => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [activeEmailModal, setActiveEmailModal] = useState<any | null>(null);

  const fetchMyRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchCustomerData(currentUser.id);
      if (data.requests) setRequests(data.requests);
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error('Failed to load customer requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-white">
          Customer Portal Sign-In
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed font-light">
          Sign in to your private account to view submitted card requests, manage payment receipts, and monitor delivery dispatches.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
        >
          Sign In to Customer Account
        </button>
      </div>
    );
  }

  // Calculate customer statistics
  const total = requests.length;
  const pendingReview = requests.filter(r => r.request_status === 'Pending Review' || r.request_status === 'Submitted').length;
  const inProcessing = requests.filter(r => r.request_status === 'Approved' || r.request_status === 'Processing' || r.request_status === 'Printed').length;
  const dispatched = requests.filter(r => r.request_status === 'Dispatched' || r.request_status === 'Ready for Dispatch').length;
  const delivered = requests.filter(r => r.request_status === 'Delivered').length;
  const unpaid = requests.filter(r => r.payment_status === 'Unpaid').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block">
            Customer Account Area
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Welcome, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Registered: {currentUser.email}
          </p>
        </div>

        <button
          onClick={() => onNavigate('request')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30"
        >
          <CreditCard className="w-4 h-4" />
          <span>New Card Request</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Requests</span>
          <span className="text-xl font-bold text-white font-heading">{total}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Pending Review</span>
          <span className="text-xl font-bold text-amber-400 font-heading">{pendingReview}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">In Production</span>
          <span className="text-xl font-bold text-blue-400 font-heading">{inProcessing}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Dispatched</span>
          <span className="text-xl font-bold text-indigo-400 font-heading">{dispatched}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Delivered</span>
          <span className="text-xl font-bold text-emerald-400 font-heading">{delivered}</span>
        </div>
      </div>

      {/* Email Notifications & Payout Alerts */}
      {notifications.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-900 border border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Official Email Dispatches & Payout Confirmations
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">
              {notifications.length} message{notifications.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{notif.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Delivered
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{notif.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(notif.sent_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setActiveEmailModal(notif)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Email</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-white">
          My Card Requests
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/30 border border-slate-800 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-semibold text-white text-sm">No card requests registered yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't requested any physical cards on this account. Start your application to personalize your card.
            </p>
            <button
              onClick={() => onNavigate('request')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              Request a Card Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-900/60 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-400 block">
                      {item.request_id}
                    </span>
                    <span className="text-sm font-semibold text-white block mt-0.5">
                      {item.cardholder_name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Network: {item.card_network}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                      {item.request_status}
                    </span>
                    <span className={`text-[10px] font-medium ${item.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.payment_status}
                    </span>
                  </div>
                </div>

                {/* Compact preview mockup */}
                <div className="w-full flex justify-center py-2">
                  <div className="w-48 aspect-[1.586] rounded-xl overflow-hidden border border-blue-900/40 shadow-md">
                    <Card3D
                      cardholderName={item.cardholder_name}
                      network={item.card_network}
                      simulatedNumber={item.simulated_card_number}
                      showFlipButton={false}
                      className="pointer-events-none scale-75 -my-4"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.submitted_at || item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.shipment?.tracking_id && (
                      <button
                        onClick={() => onNavigate('track', { trackingId: item.shipment.tracking_id })}
                        className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-blue-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReq(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0f1e] border border-blue-900/60 rounded-2xl max-w-2xl w-full p-6 max-h-[88vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase">Request Record</span>
                <h3 className="font-heading font-bold text-xl text-white">
                  {selectedReq.request_id}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                {selectedReq.request_status}
              </span>
            </div>

            {/* 3D Preview in Details */}
            <div className="flex flex-col items-center">
              <Card3D
                cardholderName={selectedReq.cardholder_name}
                network={selectedReq.card_network}
                simulatedNumber={selectedReq.simulated_card_number}
                className="w-full max-w-sm"
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Order Specifications</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cardholder:</span>
                  <span className="text-white font-medium">{selectedReq.cardholder_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-white font-medium capitalize">{selectedReq.card_network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className={`font-semibold ${selectedReq.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedReq.payment_status}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Delivery Address</span>
                {selectedReq.address ? (
                  <div className="text-slate-300">
                    <p>{selectedReq.address.address_line_1}</p>
                    {selectedReq.address.address_line_2 && <p>{selectedReq.address.address_line_2}</p>}
                    <p>{selectedReq.address.city}, {selectedReq.address.state_region} {selectedReq.address.postal_code}</p>
                    <p className="font-semibold text-white">{selectedReq.address.country}</p>
                  </div>
                ) : (
                  <p className="text-slate-400">Standard registered address on file</p>
                )}
              </div>
            </div>

            {/* Shipment tracker shortcut if available */}
            {selectedReq.shipment && (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-300 font-mono uppercase block">Active Shipment</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {selectedReq.shipment.tracking_id}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Status: {selectedReq.shipment.current_status} ({selectedReq.shipment.courier_name})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedReq(null);
                    onNavigate('track', { trackingId: selectedReq.shipment.tracking_id });
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Track Package
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Notification Popup Modal */}
      {activeEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button
              onClick={() => setActiveEmailModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-mono block">Official Email Notification</span>
                <h3 className="font-heading font-bold text-sm text-white">
                  {activeEmailModal.subject}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040816] border border-blue-950 font-mono text-[11px] text-slate-400 space-y-1">
              <div><strong>Recipient:</strong> {activeEmailModal.recipient_name} &lt;{activeEmailModal.recipient_email}&gt;</div>
              <div><strong>Status:</strong> Delivered • Verified TLS</div>
              <div><strong>Date:</strong> {new Date(activeEmailModal.sent_at).toLocaleString()}</div>
            </div>

            <div className="space-y-3 text-slate-200 text-xs leading-relaxed font-sans">
              <p className="font-semibold text-white">
                Dear {activeEmailModal.recipient_name},
              </p>
              <p>
                {activeEmailModal.message}
              </p>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Card Request:</span><span className="text-white font-mono">{activeEmailModal.request_id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Payout Ledger:</span><span className="text-emerald-400 font-bold">Funded to Card Balance</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Delivery Status:</span><span className="text-blue-300">Queued for Tracked Courier</span></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveEmailModal(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
