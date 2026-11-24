import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, CheckCircle2, XCircle, RefreshCw, AlertTriangle, UserCheck, Play, Activity, Filter, Clock } from 'lucide-react';
import { eventService } from '../services/api';

export default function EventReviewPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Review action state
  const [reviewAction, setReviewAction] = useState('confirm');
  const [reviewReason, setReviewReason] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newConflictType, setNewConflictType] = useState('pedestrian_vehicle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, severityFilter]);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.review_status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      const res = await eventService.getEvents(params);
      setEvents(res.data);
      if (res.data.length > 0 && !selectedEventId) {
        setSelectedEventId(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching conflict events:', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      eventService.getEventDetails(selectedEventId)
        .then(res => setEventDetail(res.data))
        .catch(err => console.error('Error fetching event details:', err));
    }
  }, [selectedEventId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewReason.trim() || reviewReason.trim().length < 3) {
      setReviewError('Mandatory human review reason is required (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);
    setReviewError(null);
    setSuccessMsg(null);

    try {
      await eventService.reviewEvent(selectedEventId, {
        action: reviewAction,
        reason: reviewReason.trim(),
        reviewer_id: 'engineer_01',
        new_severity: reviewAction === 'reclassify' ? newSeverity : undefined,
        new_conflict_type: reviewAction === 'reclassify' ? newConflictType : undefined,
      });

      setSuccessMsg(`Incident successfully ${reviewAction === 'confirm' ? 'confirmed' : reviewAction === 'reject' ? 'rejected' : 'reclassified'}!`);
      setReviewReason('');
      fetchEvents();
      const res = await eventService.getEventDetails(selectedEventId);
      setEventDetail(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ev = eventDetail?.event;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <span>Incident Review & Verification Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explainable surrogate safety screening. Reviewers must confirm, reject, or reclassify each candidate event with mandatory audit justifications.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold text-[11px] uppercase tracking-wider">Review Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="confirmed">Confirmed Conflicts</option>
              <option value="rejected">Rejected False Positives</option>
              <option value="reclassified">Reclassified</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold text-[11px] uppercase tracking-wider">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="all">All Severities</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No conflict events detected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All road users operated within calibrated safety tolerances. No post-encroachment or time-to-collision thresholds crossed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Event List (4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Candidate Near-Miss Events ({events.length})
            </div>
            {events.map((item) => {
              const isSelected = item.id === selectedEventId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEventId(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 capitalize">
                      {item.conflict_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        item.severity === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Road Users:</span>
                      <span className="font-mono text-slate-800 font-semibold">{item.road_user_class_pair} (T{item.track_id_1} vs T{item.track_id_2})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TTC / PET:</span>
                      <span className="font-mono text-blue-700 font-bold">
                        {item.ttc_seconds !== null ? `${item.ttc_seconds}s TTC` : item.pet_seconds !== null ? `${item.pet_seconds}s PET` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Closing Speed:</span>
                      <span className="font-mono text-slate-700">{item.max_relative_closing_speed_kmh} km/h</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono font-medium">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                        item.review_status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.review_status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.review_status === 'reclassified'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.review_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Inspection & Review Panel (8 cols) */}
          {ev && (
            <div className="lg:col-span-8 space-y-6">
              {/* Evidence Video Player with Privacy Blurring */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center space-x-2">
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                    <span>Evidence Clip (Privacy-Blurred Faces & License Plates)</span>
                  </span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] px-2.5 py-0.5 rounded font-mono font-semibold">
                    Window: {ev.start_time}s – {ev.end_time}s
                  </span>
                </div>

                <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
                  {eventDetail.evidence_url ? (
                    <video
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                      src={eventDetail.evidence_url}
                    />
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      <span>Evidence clip rendered under privacy preservation protocols</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Strict Severity vs Confidence Separation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Physical Severity Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Physical Severity</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        ev.severity === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ev.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {ev.severity} Hazard
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Effective Conflict Time:</span>
                      <span className="font-mono text-slate-900 font-bold">{ev.ttc_seconds ?? ev.pet_seconds}s</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Relative Closing Speed:</span>
                      <span className="font-mono text-slate-900 font-semibold">{ev.max_relative_closing_speed_kmh} km/h</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Crossing Angle:</span>
                      <span className="font-mono text-slate-900 font-semibold">{ev.crossing_angle_degrees}°</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Vulnerable Road User (VRU):</span>
                      <span className="font-mono text-amber-700 font-bold">
                        {ev.road_user_class_pair.includes('person') || ev.road_user_class_pair.includes('motorcycle') ? 'Yes (Higher Weight)' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistical Confidence Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Statistical Confidence</span>
                    <span className="font-mono text-lg font-bold text-blue-700">
                      {(ev.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Calibration Reliability (30%)</span>
                        <span className="font-mono text-slate-700 font-semibold">{(ev.confidence_breakdown?.components?.calibration_score * 100 || 85).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(ev.confidence_breakdown?.components?.calibration_score * 100) || 85}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Tracking Continuity (30%)</span>
                        <span className="font-mono text-slate-700 font-semibold">{(ev.confidence_breakdown?.components?.tracking_score * 100 || 80).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(ev.confidence_breakdown?.components?.tracking_score * 100) || 80}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">YOLO Detection Confidence (20%)</span>
                        <span className="font-mono text-slate-700 font-semibold">{(ev.confidence_breakdown?.components?.detection_score * 100 || 75).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(ev.confidence_breakdown?.components?.detection_score * 100) || 75}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Visibility & Video Quality (20%)</span>
                        <span className="font-mono text-slate-700 font-semibold">{(ev.confidence_breakdown?.components?.visibility_score * 100 || 90).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(ev.confidence_breakdown?.components?.visibility_score * 100) || 90}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Human Verification Action Form */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Human Verification Decision</span>
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Review actions are permanently logged into the auditable incident history. A mandatory engineering reason is required for every decision.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setReviewAction('confirm')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                        reviewAction === 'confirm'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Confirm Conflict</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewAction('reject')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                        reviewAction === 'reject'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-white" />
                      <span>Reject False Positive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewAction('reclassify')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                        reviewAction === 'reclassify'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>Reclassify</span>
                    </button>
                  </div>

                  {reviewAction === 'reclassify' && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Adjusted Severity</label>
                        <select
                          value={newSeverity}
                          onChange={(e) => setNewSeverity(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Adjusted Conflict Type</label>
                        <select
                          value={newConflictType}
                          onChange={(e) => setNewConflictType(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                        >
                          <option value="pedestrian_vehicle">Pedestrian - Vehicle Conflict</option>
                          <option value="two_wheeler_vehicle">Two-Wheeler - Vehicle Conflict</option>
                          <option value="unsafe_turn">Unsafe Turn Conflict</option>
                          <option value="following_behaviour">Following Behaviour</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mandatory Audit Review Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Explain justification for confirming, rejecting, or reclassifying (e.g. 'Pedestrian stepped off curb during vehicle turn, vehicle braked abruptly')."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {reviewError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <span>Recording Audit Log...</span>
                      ) : (
                        <span>Commit Review Decision</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Immutable Audit Log Trail */}
              {eventDetail.audit_logs && eventDetail.audit_logs.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Audit Trail Log History</h4>
                  <div className="space-y-2.5 text-xs">
                    {eventDetail.audit_logs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 capitalize">{log.action}</span>
                            <span className="text-slate-500 font-medium">({log.previous_status} &rarr; {log.new_status})</span>
                          </div>
                          <p className="text-slate-600 mt-1 italic">"{log.reason}"</p>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono font-medium">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
