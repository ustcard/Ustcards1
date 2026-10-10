import React, { useState, useEffect } from 'react';
import { Card3D } from '../components/Card3D';
import { VisaLogo, MastercardLogo } from '../components/CardVisuals';
import {
  generateCompleteZipPackage,
  renderFlatFrontCanvas,
  renderFlatBackCanvas,
  generateDetailsPdf,
  formatFullCardNumber
} from '../utils/printPackage';
import {
  LayoutDashboard,
  CreditCard,
  Palette,
  DollarSign,
  Truck,
  Settings as SettingsIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  User,
  MapPin,
  ExternalLink,
  RefreshCw,
  Eye,
  Archive
} from 'lucide-react';
import {
  fetchAdminData,
  approveCardRequest,
  rejectCardRequest,
  updateCardRequestStatus,
  createShipment,
  addTrackingEvent,
  updatePricingItem,
  updatePlatformSettings
} from '../services/apiClient';

interface AdminDashboardProps {
  currentUser: any;
  onLogout: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onExitAdmin
}) => {
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'designs' | 'pricing' | 'shipments' | 'settings' | 'audit'>('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [shipmentsList, setShipmentsList] = useState<any[]>([]);
  const [designsList, setDesignsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [networkFilter, setNetworkFilter] = useState('all');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [shipmentModalReq, setShipmentModalReq] = useState<any | null>(null);
  const [newCourier, setNewCourier] = useState('Apex Priority Express');
  const [printPkgModal, setPrintPkgModal] = useState<any | null>(null);
  const [generatingPrintPkg, setGeneratingPrintPkg] = useState(false);
  const [pricingModalItem, setPricingModalItem] = useState<any | null>(null);
  const [addEventShipment, setAddEventShipment] = useState<any | null>(null);
  const [newEventStatus, setNewEventStatus] = useState('In Transit');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Notifications / feedback
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Prevent background scroll when mobile drawer is open (Requirement #7 & #8)
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminData(currentUser?.id);
      if (data.stats) setStats(data.stats);
      if (data.requests) setRequests(data.requests);
      if (data.pricing) setPricingList(data.pricing);
      if (data.shipments) setShipmentsList(data.shipments);
      if (data.designs) setDesignsList(data.designs);
      if (data.settings) setSettings(data.settings);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 5000);
  };

  // Close mobile drawer on navigation (Requirement #4)
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
  };

  // ================= ADMIN ACTIONS =================

  // Approve Request
  const handleApprove = async (reqId: string) => {
    try {
      await approveCardRequest(reqId, currentUser?.id);
      triggerAlert('success', `Request successfully approved.`);
      setSelectedRequest(null);
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Approval failed');
    }
  };

  // Reject Request
  const handleReject = async () => {
    if (!rejectModalReq || !rejectionReason.trim()) return;
    try {
      await rejectCardRequest(rejectModalReq.id, rejectionReason.trim(), currentUser?.id);
      triggerAlert('success', `Request ${rejectModalReq.request_id} rejected. Reason logged in audit.`);
      setRejectModalReq(null);
      setRejectionReason('');
      setSelectedRequest(null);
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Rejection failed');
    }
  };

  // Update Request Status directly (e.g. Processing, Printed, Ready for Dispatch)
  const handleUpdateStatus = async (reqId: string, status: string) => {
    try {
      await updateCardRequestStatus(reqId, status, currentUser?.id);
      triggerAlert('success', `Status updated to ${status}`);
      loadAdminData();
      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, request_status: status });
      }
    } catch (err: any) {
      triggerAlert('error', err.message || 'Update failed');
    }
  };

  // Generate Print Package (Requirement #17)
  const handleGeneratePrintPackage = async (targetReq: any) => {
    setGeneratingPrintPkg(true);
    try {
      // 1. Notify server
      const res = await fetch('/api/print-packages/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.id || 'usr_admin_1'}`
        },
        body: JSON.stringify({ request_id: targetReq.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Generate actual files in browser (high-res flat canvases & PDF)
      const packageData = {
        requestId: targetReq.request_id,
        cardholderName: targetReq.cardholder_name,
        network: targetReq.card_network,
        simulatedNumber: formatFullCardNumber(targetReq.simulated_card_number, targetReq.card_network),
        simulatedExpiry: targetReq.simulated_expiry,
        submissionDate: targetReq.submitted_at,
        approvedDate: targetReq.approved_at,
        approvedBy: targetReq.approved_by || currentUser?.full_name,
        deliveryAddress: targetReq.address
      };

      const frontCanvas = renderFlatFrontCanvas(packageData);
      const backCanvas = renderFlatBackCanvas(packageData);
      const frontDataUrl = frontCanvas.toDataURL('image/png');
      const backDataUrl = backCanvas.toDataURL('image/png');
      const pdfDoc = generateDetailsPdf(packageData, frontDataUrl, backDataUrl);

      setPrintPkgModal({
        targetReq,
        packageData,
        frontDataUrl,
        backDataUrl,
        pdfDoc
      });

      triggerAlert('success', `Print Package generated for ${targetReq.request_id}`);
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Failed to generate print package');
    } finally {
      setGeneratingPrintPkg(false);
    }
  };

  // Download complete ZIP
  const handleDownloadZip = async () => {
    if (!printPkgModal) return;
    try {
      const zipBlob = await generateCompleteZipPackage(printPkgModal.packageData);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PrintPackage_${printPkgModal.targetReq.request_id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // Download individual file
  const handleDownloadFile = (type: 'front' | 'back' | 'pdf') => {
    if (!printPkgModal) return;
    const ref = printPkgModal.targetReq.request_id;
    if (type === 'front') {
      const a = document.createElement('a');
      a.href = printPkgModal.frontDataUrl;
      a.download = `${ref}_front.png`;
      a.click();
    } else if (type === 'back') {
      const a = document.createElement('a');
      a.href = printPkgModal.backDataUrl;
      a.download = `${ref}_back.png`;
      a.click();
    } else if (type === 'pdf') {
      printPkgModal.pdfDoc.save(`${ref}_card-details.pdf`);
    }
  };

  // Create Shipment
  const handleCreateShipment = async () => {
    if (!shipmentModalReq) return;
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.id || 'usr_admin_1'}`
        },
        body: JSON.stringify({
          request_id: shipmentModalReq.id,
          courier_name: newCourier,
          destination_summary: shipmentModalReq.address
            ? `${shipmentModalReq.address.city}, ${shipmentModalReq.address.state_region}, ${shipmentModalReq.address.country}`
            : 'Tracked Dispatch'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      triggerAlert('success', `Shipment created with Tracking ID: ${data.shipment.tracking_id}`);
      setShipmentModalReq(null);
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Shipment creation failed');
    }
  };

  // Add Tracking Event
  const handleAddTrackingEvent = async () => {
    if (!addEventShipment || !newEventDesc.trim()) return;
    try {
      await addTrackingEvent(addEventShipment.id, {
        status: newEventStatus,
        location: newEventLocation.trim(),
        description: newEventDesc.trim()
      }, currentUser?.id);

      triggerAlert('success', `Milestone event '${newEventStatus}' recorded`);
      setAddEventShipment(null);
      setNewEventDesc('');
      setNewEventLocation('');
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Failed to add tracking event');
    }
  };

  // Save Pricing Item
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingModalItem) return;
    try {
      await updatePricingItem(pricingModalItem.id, pricingModalItem.amount, pricingModalItem.is_enabled, currentUser?.id);
      triggerAlert('success', `Pricing saved: ${pricingModalItem.service_name}`);
      setPricingModalItem(null);
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Pricing save failed');
    }
  };

  // Delete Pricing Item
  const handleDeletePricing = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service fee?')) return;
    try {
      const res = await fetch(`/api/pricing/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser?.id || 'usr_admin_1'}` }
      });
      if (res.ok) {
        triggerAlert('success', 'Pricing item removed');
        loadAdminData();
      }
    } catch (err: any) {
      triggerAlert('error', err.message || 'Delete failed');
    }
  };

  // Save Global Settings & Watermark
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePlatformSettings(settings, currentUser?.id);
      triggerAlert('success', 'Platform branding and watermark settings updated');
      loadAdminData();
    } catch (err: any) {
      triggerAlert('error', err.message || 'Settings update failed');
    }
  };

  // Navigation Items
  const navItems = [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Card Requests', icon: CreditCard, count: stats?.pendingReview },
    { key: 'designs', label: 'Card Designs', icon: Palette },
    { key: 'pricing', label: 'Pricing Settings', icon: DollarSign },
    { key: 'shipments', label: 'Shipments & Tracking', icon: Truck, count: stats?.inTransit },
    { key: 'settings', label: 'Branding & Watermark', icon: SettingsIcon },
    { key: 'audit', label: 'Audit Logs', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col md:flex-row">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-[#060c1d] border-r border-blue-950/60 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm text-white tracking-tight block">
                UNIVERSAL <span className="text-blue-500">ADMIN</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">STAFF CONSOLE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-blue-700' : 'bg-blue-950 text-blue-300'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & exit actions */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="px-2 py-1.5 rounded-lg bg-slate-900/80 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="font-semibold text-white block truncate">{currentUser?.full_name || 'Administrator'}</span>
              <span className="text-[10px] text-blue-400 capitalize">{currentUser?.role?.replace('_', ' ') || 'Super Admin'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onExitAdmin}
              className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-center cursor-pointer"
            >
              Public Site
            </button>
            <button
              onClick={onLogout}
              className="py-2 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-300 text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER & HAMBURGER (Requirements #1 to #10) ================= */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#060c1d] border-b border-blue-950/60 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-white">
            UNIVERSAL <span className="text-blue-500">ADMIN</span>
          </span>
        </div>

        {/* Visible Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 rounded-lg bg-slate-900 text-slate-200 hover:text-white border border-slate-800 focus:outline-none cursor-pointer"
          aria-label="Open Admin Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Slide-out (Requirements #2, #5, #7, #8, #9, #10) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop (Tapping closes drawer) */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation backdrop"
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#060c1d] border-r border-blue-900/50 p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-sm text-white">Universal Admin</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items in Drawer (Clicking any item changes tab and closes drawer) */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => { setMobileDrawerOpen(false); onExitAdmin(); }}
                className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Back to Public Site
              </button>
              <button
                onClick={() => { setMobileDrawerOpen(false); onLogout(); }}
                className="w-full py-2.5 rounded-lg bg-rose-950/60 border border-rose-900/60 text-rose-300 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top notification alert banner */}
        {actionAlert && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in ${
              actionAlert.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{actionAlert.message}</span>
            </div>
            <button onClick={() => setActionAlert(null)} className="cursor-pointer text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Operational Command Dashboard
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time database metrics, order status throughput, and recent customer activity.
                </p>
              </div>

              <button
                onClick={loadAdminData}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* 10 Real Statistics Cards (Requirement #14) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Requests</span>
                <span className="text-2xl font-bold text-white font-heading">{stats?.totalRequests ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Pending Review</span>
                <span className="text-2xl font-bold text-amber-400 font-heading">{stats?.pendingReview ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Approved</span>
                <span className="text-2xl font-bold text-emerald-400 font-heading">{stats?.approvedRequests ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Rejected</span>
                <span className="text-2xl font-bold text-rose-400 font-heading">{stats?.rejectedRequests ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Pending Payments</span>
                <span className="text-2xl font-bold text-yellow-300 font-heading">{stats?.pendingPayments ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Verified Payments</span>
                <span className="text-2xl font-bold text-teal-400 font-heading">{stats?.verifiedPayments ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Cards in Production</span>
                <span className="text-2xl font-bold text-blue-400 font-heading">{stats?.cardsBeingProduced ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Ready for Dispatch</span>
                <span className="text-2xl font-bold text-indigo-400 font-heading">{stats?.readyForDispatch ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">In Transit</span>
                <span className="text-2xl font-bold text-sky-400 font-heading">{stats?.inTransit ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Delivered</span>
                <span className="text-2xl font-bold text-green-400 font-heading">{stats?.delivered ?? 0}</span>
              </div>
            </div>

            {/* Quick Actions & Recent Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-white">Recent Customer Requests</h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    View All ({requests.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  {requests.slice(0, 5).map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-semibold text-white">{r.request_id}</span>
                        <span className="text-slate-400 block">{r.cardholder_name} ({r.card_network})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 border border-blue-900 text-blue-300">
                          {r.request_status}
                        </span>
                        <button
                          onClick={() => { setSelectedRequest(r); setActiveTab('requests'); }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links & System status */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 text-xs">
                <h3 className="font-heading font-bold text-sm text-white">System Controls</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('designs')}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-700/60 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Card Artwork & Coordinate Config</span>
                    <Palette className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-700/60 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Service Fee Matrix</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-700/60 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Global Watermark & Branding</span>
                    <SettingsIcon className="w-4 h-4 text-purple-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CARD REQUESTS (Requirement #15) ================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Card Request Management
                </h1>
                <p className="text-xs text-slate-400">
                  Audit, approve, reject with reason, configure manufacturing packages, and create shipments.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Processing">Processing</option>
                  <option value="Printed">Printed</option>
                  <option value="Ready for Dispatch">Ready for Dispatch</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none"
                >
                  <option value="all">All Networks</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                </select>
              </div>
            </div>

            {/* Requests Table / Responsive Cards (Requirement #13) */}
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-3.5">Request ID</th>
                      <th className="p-3.5">Customer & Email</th>
                      <th className="p-3.5">Network</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {requests
                      .filter(r => {
                        if (statusFilter !== 'all' && r.request_status !== statusFilter) return false;
                        if (networkFilter !== 'all' && r.card_network !== networkFilter) return false;
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          return (
                            r.request_id.toLowerCase().includes(q) ||
                            r.cardholder_name.toLowerCase().includes(q) ||
                            (r.customer_email && r.customer_email.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map((reqItem) => (
                        <tr key={reqItem.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-mono font-bold text-white">{reqItem.request_id}</td>
                          <td className="p-3.5">
                            <span className="font-semibold text-white block">{reqItem.cardholder_name}</span>
                            <span className="text-[11px] text-slate-400">{reqItem.customer_email || 'On file'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="capitalize">{reqItem.card_network}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950 border border-blue-900 text-blue-300">
                              {reqItem.request_status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[11px] font-medium ${reqItem.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {reqItem.payment_status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400">
                            {new Date(reqItem.submitted_at || reqItem.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedRequest(reqItem)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                            >
                              Details
                            </button>
                            {reqItem.request_status === 'Pending Review' && (
                              <button
                                onClick={() => handleApprove(reqItem.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards (Requirement #13) */}
              <div className="lg:hidden space-y-3">
                {requests
                  .filter(r => {
                    if (statusFilter !== 'all' && r.request_status !== statusFilter) return false;
                    if (networkFilter !== 'all' && r.card_network !== networkFilter) return false;
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      return (
                        r.request_id.toLowerCase().includes(q) ||
                        r.cardholder_name.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((reqItem) => (
                    <div key={reqItem.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">{reqItem.request_id}</span>
                          <span className="text-slate-300 block font-medium mt-0.5">{reqItem.cardholder_name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">Network: {reqItem.card_network}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 border border-blue-900 text-blue-300">
                          {reqItem.request_status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className={`text-[11px] font-medium ${reqItem.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Payment: {reqItem.payment_status}
                        </span>
                        <button
                          onClick={() => setSelectedRequest(reqItem)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer"
                        >
                          Manage Request
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CARD DESIGNS (Requirement #16) ================= */}
        {activeTab === 'designs' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Card Design & Master Artwork Management
                </h1>
                <p className="text-xs text-slate-400">
                  Authoritative master blue artwork template, silver contactless chip geometry, and dynamic coordinate matrix.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Preview with Watermark toggle */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#070e24] border border-blue-900/50 shadow-2xl flex flex-col items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase mb-3 block">
                    Active Master Template Specimen
                  </span>
                  <Card3D
                    cardholderName="JASON AARON"
                    network="visa"
                    watermarkSettings={settings?.watermark_enabled ? {
                      enabled: true,
                      text: settings.watermark_text,
                      opacity: settings.watermark_opacity
                    } : undefined}
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-white block">Authoritative Artwork Rules:</span>
                  <p className="text-slate-400 leading-relaxed">
                    Master blue abstract composition, silver contactless EMV elements, and authorized network logos are strictly preserved without distortion.
                  </p>
                </div>
              </div>

              {/* Version History & Configurations */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 text-xs">
                  <h3 className="font-heading font-bold text-sm text-white">
                    Master Artwork Versions & Metadata
                  </h3>

                  {designsList.map((des) => (
                    <div key={des.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{des.design_name}</span>
                        {des.is_active && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            ACTIVE SYSTEM MASTER
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>Standard: CR80 ISO/IEC 7810</div>
                        <div>Chip: Silver Contactless EMV</div>
                        <div>Aspect Ratio: 1.586 (1012x638)</div>
                        <div>Foil: Royal Deep Blue Base</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PRICING (Requirement #18) ================= */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Configurable Service Pricing
                </h1>
                <p className="text-xs text-slate-400">
                  Manage backend prices. Customers see itemized summaries with real totals computed by server.
                </p>
              </div>

              <button
                onClick={() => setPricingModalItem({ service_name: '', description: '', amount: 10, currency: 'USD', is_enabled: true })}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service Fee</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="p-3.5">Service Name</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {pricingList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="p-3.5 font-bold text-white">{p.service_name}</td>
                      <td className="p-3.5 text-slate-400 max-w-xs">{p.description}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        ${Number(p.amount).toFixed(2)} {p.currency}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.is_enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                          {p.is_enabled ? 'Active / Charged' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setPricingModalItem(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePricing(p.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SHIPMENTS & TRACKING (Requirement #19) ================= */}
        {activeTab === 'shipments' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-white">
                  Shipment & Tracking Management
                </h1>
                <p className="text-xs text-slate-400">
                  Assign courier partners, issue unique tracking IDs, and publish verifiable checkpoint milestones.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {shipmentsList.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-blue-400 block">{s.tracking_id}</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{s.courier_name} — Ref: {s.courier_reference}</span>
                      <span className="text-[11px] text-slate-400">Destination: {s.destination_summary}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                        {s.current_status}
                      </span>
                      <button
                        onClick={() => {
                          setAddEventShipment(s);
                          setNewEventStatus(s.current_status);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                      >
                        + Add Checkpoint Event
                      </button>
                    </div>
                  </div>

                  {/* Events list */}
                  {s.events && s.events.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Milestone Scans</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {s.events.map((evt: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/70 text-[11px]">
                            <div className="flex justify-between font-semibold text-white">
                              <span>{evt.status}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{new Date(evt.event_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {evt.location && <div className="text-blue-300 text-[10px]">{evt.location}</div>}
                            <div className="text-slate-400 mt-1">{evt.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: BRANDING & WATERMARK (Requirement #22) ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in max-w-4xl">
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Platform Branding & Watermark Settings
            </h1>

            {settings && (
              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6 text-xs">
                {/* Watermark Section */}
                <div className="space-y-4 border-b border-slate-800 pb-6">
                  <h3 className="font-heading font-bold text-sm text-white">Specimen Watermark Controls</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.watermark_enabled}
                      onChange={(e) => setSettings({ ...settings, watermark_enabled: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 cursor-pointer"
                    />
                    <span className="text-slate-200 font-semibold">Enable Specimen Watermark on Previews</span>
                  </label>

                  <div>
                    <label className="block text-slate-400 mb-1">Watermark Overlay Text</label>
                    <input
                      type="text"
                      value={settings.watermark_text}
                      onChange={(e) => setSettings({ ...settings, watermark_text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Opacity ({settings.watermark_opacity})</label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={settings.watermark_opacity}
                        onChange={(e) => setSettings({ ...settings, watermark_opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Position</label>
                      <select
                        value={settings.watermark_position}
                        onChange={(e) => setSettings({ ...settings, watermark_position: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="diagonal">Diagonal Across</option>
                        <option value="center">Center</option>
                        <option value="bottom_right">Bottom Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Platform Identity */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-sm text-white">Platform Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={settings.platform_name}
                        onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settings.support_email}
                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-md"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 7: AUDIT LOGS ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Immutable Administrative Audit Logs
            </h1>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Entity</th>
                    <th className="p-3.5">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-3.5 font-mono text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-3.5 font-semibold text-white">{log.actor_name}</td>
                      <td className="p-3.5 font-mono text-blue-400">{log.action}</td>
                      <td className="p-3.5">{log.entity_type}</td>
                      <td className="p-3.5 text-slate-300 max-w-md">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= REQUEST DETAILS MODAL ================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase">Operational Request View</span>
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  {selectedRequest.request_id}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                  {selectedRequest.request_status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedRequest.payment_status === 'Paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                  {selectedRequest.payment_status}
                </span>
              </div>
            </div>

            {/* Interactive 3D Preview in Admin */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-black/40 border border-slate-800">
              <Card3D
                cardholderName={selectedRequest.cardholder_name}
                network={selectedRequest.card_network}
                simulatedNumber={formatFullCardNumber(selectedRequest.simulated_card_number, selectedRequest.card_network)}
                simulatedExpiry={selectedRequest.simulated_expiry}
              />
            </div>

            {/* Customer & Delivery Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-heading font-semibold text-white border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  Customer Information
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cardholder Name:</span>
                  <span className="text-white font-medium">{selectedRequest.cardholder_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white font-medium">{selectedRequest.customer_email || 'On record'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-white font-medium">{selectedRequest.customer_phone || 'On record'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-heading font-semibold text-white border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Delivery Coordinates
                </h4>
                {selectedRequest.address ? (
                  <div className="text-slate-300 space-y-0.5">
                    <p>{selectedRequest.address.address_line_1}</p>
                    {selectedRequest.address.address_line_2 && <p>{selectedRequest.address.address_line_2}</p>}
                    <p>{selectedRequest.address.city}, {selectedRequest.address.state_region} {selectedRequest.address.postal_code}</p>
                    <p className="font-semibold text-white">{selectedRequest.address.country}</p>
                  </div>
                ) : (
                  <p className="text-slate-400">Standard registered address on file</p>
                )}
              </div>
            </div>

            {/* Rejection Note if rejected */}
            {selectedRequest.request_status === 'Rejected' && selectedRequest.rejection_reason && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
                <span className="font-bold block">Rejection Reason:</span>
                <p className="mt-0.5">{selectedRequest.rejection_reason}</p>
              </div>
            )}

            {/* ACTION BUTTONS (Requirement #15, #17) */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedRequest.request_status === 'Pending Review' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Request</span>
                    </button>
                    <button
                      onClick={() => setRejectModalReq(selectedRequest)}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>
                  </>
                )}

                {/* Working Button: GENERATE PRINT PACKAGE (Requirement #17) */}
                <button
                  onClick={() => handleGeneratePrintPackage(selectedRequest)}
                  disabled={generatingPrintPkg}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{generatingPrintPkg ? 'Generating Files...' : 'GENERATE PRINT PACKAGE'}</span>
                </button>

                {/* Production Lifecycle Status Transitions */}
                {selectedRequest.request_status === 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Processing')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                  >
                    Start Production
                  </button>
                )}

                {(selectedRequest.request_status === 'Processing' || selectedRequest.request_status === 'Printed') && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Ready for Dispatch')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                  >
                    Mark Ready for Dispatch
                  </button>
                )}

                {/* Shipment Creation Trigger */}
                {!selectedRequest.shipment && (
                  <button
                    onClick={() => setShipmentModalReq(selectedRequest)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Create Courier Shipment</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINT PACKAGE DOWNLOAD MODAL (Requirement #17) ================= */}
      {printPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setPrintPkgModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase">Files Generated Successfully</span>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Print Production Package — {printPkgModal.targetReq.request_id}
              </h3>
              <p className="text-slate-400">
                CR80 standard 300 DPI flat artwork files and production audit sheet ready for manufacturing.
              </p>
            </div>

            {/* File List */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">front.png</span>
                  <span className="text-[11px] text-slate-400">Flat 300 DPI CR80 Front Specimen (1012x638)</span>
                </div>
                <button
                  onClick={() => handleDownloadFile('front')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">back.png</span>
                  <span className="text-[11px] text-slate-400">Flat 300 DPI CR80 Back Specimen (Magnetic Stripe & Panel)</span>
                </div>
                <button
                  onClick={() => handleDownloadFile('back')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">card-details.pdf</span>
                  <span className="text-[11px] text-slate-400">Official Specification Sheet with Proofs & Logistics</span>
                </div>
                <button
                  onClick={() => handleDownloadFile('pdf')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Complete Zip Package Download */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Complete Print Bundle (.ZIP)</span>
                <span className="text-[11px] text-slate-300">Contains front.png, back.png, card-details.pdf & manifest.json</span>
              </div>
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Archive className="w-4 h-4" />
                <span>Download All (.zip)</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPrintPkgModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT APPLICATION MODAL ================= */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-heading font-bold text-base text-white">
              Reject Request: {rejectModalReq.request_id}
            </h3>
            <p className="text-slate-400">
              A specific rejection reason is required for compliance audit logs.
            </p>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete street address or invalid identity format."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setRejectModalReq(null); setRejectionReason(''); }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE SHIPMENT MODAL ================= */}
      {shipmentModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-heading font-bold text-base text-white">
              Create Shipment for {shipmentModalReq.request_id}
            </h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Courier Service</label>
              <select
                value={newCourier}
                onChange={(e) => setNewCourier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="Apex Priority Express">Apex Priority Express</option>
                <option value="DHL Express Logistics">DHL Express Logistics</option>
                <option value="FedEx Custom Secure">FedEx Custom Secure</option>
                <option value="Royal Mail Tracked">Royal Mail Tracked</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Generating this shipment will create a unique tracking ID formatted as <span className="font-mono text-white">UST-TRK-XXXXXX</span> and register the initial fulfillment checkpoint.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShipmentModalReq(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShipment}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
              >
                Generate Shipment & Tracking ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD TRACKING EVENT MODAL ================= */}
      {addEventShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-heading font-bold text-base text-white">
              Add Event to {addEventShipment.tracking_id}
            </h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Milestone Status</label>
              <select
                value={newEventStatus}
                onChange={(e) => setNewEventStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Arrived at Local Facility">Arrived at Local Facility</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Delivery Attempted">Delivery Attempted</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Location Checkpoint</label>
              <input
                type="text"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                placeholder="e.g. Regional Sorting Hub, Portland OR"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Audit Description *</label>
              <textarea
                rows={2}
                required
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="e.g. Package scanned through sorting matrix, loaded onto delivery van."
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddEventShipment(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrackingEvent}
                disabled={!newEventDesc.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                Record Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRICING ITEM MODAL ================= */}
      {pricingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSavePricing} className="bg-[#090f22] border border-blue-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-heading font-bold text-base text-white">
              {pricingModalItem.id ? 'Edit Service Charge' : 'New Service Charge'}
            </h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={pricingModalItem.service_name}
                onChange={(e) => setPricingModalItem({ ...pricingModalItem, service_name: e.target.value })}
                placeholder="e.g. Card Production"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description</label>
              <textarea
                rows={2}
                value={pricingModalItem.description}
                onChange={(e) => setPricingModalItem({ ...pricingModalItem, description: e.target.value })}
                placeholder="Clear explanation of charge"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={pricingModalItem.amount}
                  onChange={(e) => setPricingModalItem({ ...pricingModalItem, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Currency</label>
                <input
                  type="text"
                  value={pricingModalItem.currency}
                  onChange={(e) => setPricingModalItem({ ...pricingModalItem, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={pricingModalItem.is_enabled}
                onChange={(e) => setPricingModalItem({ ...pricingModalItem, is_enabled: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span className="text-slate-200">Active and charged on new requests</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPricingModalItem(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
              >
                Save Fee
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
