import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, MapPin, Truck, AlertCircle, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { trackShipmentPublic } from '../services/apiClient';

interface TrackingPageProps {
  initialTrackingId?: string;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ initialTrackingId = '' }) => {
  const [trackingInput, setTrackingInput] = useState(initialTrackingId);
  const [shipmentData, setShipmentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Milestone template sequence
  const standardMilestones = [
    'Request Received',
    'Card Approved',
    'Card Processing',
    'Card Printed',
    'Awaiting Dispatch',
    'Dispatched',
    'In Transit',
    'Arrived at Local Facility',
    'Out for Delivery',
    'Delivered'
  ];

  const fetchTracking = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setShipmentData(null);

    try {
      const data = await trackShipmentPublic(id.trim());
      setShipmentData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tracking lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingInput(initialTrackingId);
      fetchTracking(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingInput);
  };

  // Determine stage progression
  const getStageIndex = (status: string) => {
    const idx = standardMilestones.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = shipmentData ? getStageIndex(shipmentData.current_status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-xs text-blue-300 font-mono">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Courier & Manufacturing Tracker</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
          Track Your Sports Pass Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light">
          Enter your unique tracking reference to monitor physical card manufacturing, quality inspection, courier handover, and real-time transit milestones.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Enter Tracking ID (e.g. UST-TRK-8F42K9)"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !trackingInput.trim()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Quick Sample Button for Reviewer */}
        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          <span>Test with sample shipment:</span>
          <button
            type="button"
            onClick={() => {
              setTrackingInput('UST-TRK-8F42K9');
              fetchTracking('UST-TRK-8F42K9');
            }}
            className="text-blue-400 hover:underline font-mono cursor-pointer"
          >
            UST-TRK-8F42K9
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs sm:text-sm flex items-start gap-3 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Shipment Record Not Found</p>
            <p className="text-slate-300 font-light">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Tracking Results View */}
      {shipmentData && (
        <div className="space-y-8 animate-in fade-in">
          {/* Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#070e24] border border-blue-900/50 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase block">Active Tracking Reference</span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-white font-mono tracking-wider">
                  {shipmentData.tracking_id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-500/50 text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  {shipmentData.current_status}
                </span>
              </div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Assigned Courier</span>
                <span className="font-semibold text-white">{shipmentData.courier_name || 'Apex Priority Express'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Destination Region</span>
                <span className="font-semibold text-white truncate block">{shipmentData.destination_summary || 'Priority Dispatch'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Estimated Delivery</span>
                <span className="font-semibold text-white">{shipmentData.estimated_delivery || 'In Schedule'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Card Request Ref</span>
                <span className="font-semibold text-white font-mono">{shipmentData.request_reference || 'UST-CARD'}</span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar for Key Stages */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-sm text-white">
              Lifecycle Progress Stage
            </h3>

            {/* Horizontal stage indicator */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { stage: 'Vetted', stepIdx: 1 },
                { stage: 'Printed', stepIdx: 3 },
                { stage: 'Dispatched', stepIdx: 5 },
                { stage: 'In Transit', stepIdx: 6 },
                { stage: 'Delivered', stepIdx: 9 }
              ].map((item, i) => {
                const isPassed = currentStageIndex >= item.stepIdx;
                const isCurrent = currentStageIndex === item.stepIdx || (i === 3 && currentStageIndex === 6);
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        isPassed ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    />
                    <span className={`text-[10px] font-medium ${isCurrent ? 'text-blue-400 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                      {item.stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Milestone Events Timeline */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recorded Audit Milestone Events
            </h3>

            {shipmentData.events && shipmentData.events.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-blue-900/50">
                {shipmentData.events.map((evt: any, idx: number) => {
                  const isLatest = idx === shipmentData.events.length - 1;
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                          isLatest
                            ? 'bg-blue-500 border-white ring-4 ring-blue-500/20'
                            : 'bg-slate-900 border-blue-600'
                        }`}
                      />

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-heading font-bold text-sm text-white">
                            {evt.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(evt.event_at).toLocaleString()}
                          </span>
                        </div>

                        {evt.location && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-300">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{evt.location}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Shipment recorded. Detailed checkpoint scans will appear as courier handling progresses.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
