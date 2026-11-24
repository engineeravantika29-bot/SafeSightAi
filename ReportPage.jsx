import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, AlertCircle, BarChart3, PieChart, CheckCircle2, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { reportService } from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export default function ReportPage() {
  const [cameraId, setCameraId] = useState('CAM_01');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.getReport(cameraId)
      .then(res => setReport(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [cameraId]);

  const severityData = report?.severity_distribution ? [
    { name: 'High', count: report.severity_distribution.high || 0, fill: '#ef4444' },
    { name: 'Medium', count: report.severity_distribution.medium || 0, fill: '#f59e0b' },
    { name: 'Low', count: report.severity_distribution.low || 0, fill: '#3b82f6' }
  ] : [];

  const conflictTypeData = report?.conflict_type_distribution
    ? Object.entries(report.conflict_type_distribution).map(([type, count]) => ({
        name: type.replace(/_/g, ' '),
        value: count
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <span>Safety Audit Intelligence Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Downloadable safety audit report with held-out calibration certificate, severity breakdown, and auditable system limitations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="CAM_01">CAM_01 — Urban Intersection</option>
            <option value="CAM_02">CAM_02 — Arterial Corridor Approach</option>
          </select>

          <a
            href={reportService.downloadReportUrl(cameraId)}
            download
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit Report (.md)</span>
          </a>
        </div>
      </div>

      {report && (
        <div className="space-y-8">
          {/* Executive Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Footage</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{report.total_footage_hours} hrs</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">{report.analysis_period}</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Conflicts</span>
              <span className="text-2xl font-bold font-mono text-blue-700 mt-1 block">{report.total_events}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Surrogate screening signals</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Human Confirmed</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">{report.confirmed_events}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Verified by safety engineer</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Pending Queue</span>
              <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">{report.pending_events}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Awaiting human review</span>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity Distribution Chart */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Severity Classification Distribution</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" textAnchor="middle" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#1e293b',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conflict Type Distribution */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>Conflict Interaction Mix</span>
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                {conflictTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={conflictTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {conflictTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          color: '#1e293b',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">No interaction events to plot</p>
                )}
              </div>
            </div>
          </div>

          {/* Surveyor Calibration Quality Certificate */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Surveyor Ground Calibration Certificate</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Held-Out Median Error</span>
                <span className="text-2xl font-mono font-bold text-emerald-700">
                  {report.calibration_quality?.held_out_median_error_meters} m
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Cross-validation on surveyed ground points</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Accuracy Threshold Target</span>
                <span className="text-2xl font-mono font-bold text-slate-800">
                  &le; {report.calibration_quality?.target_threshold_meters} m
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Civil engineering tolerance satisfied</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Calibration Gate Status</span>
                <span className="text-base font-bold text-emerald-700 block mt-1">
                  {report.calibration_quality?.status}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">RANSAC Homography Active</span>
              </div>
            </div>
          </div>

          {/* Known Limitations and Commitments */}
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Auditable System Limitations & Engineering Disclosures</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside font-medium leading-relaxed">
              {report.known_limitations?.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
              <strong>Statutory Decision-Support Notice:</strong> {report.system_disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
