import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, Cpu, Layers } from 'lucide-react';
import { jobService } from '../services/api';

const PIPELINE_STAGES = [
  { id: 1, name: 'Video Ingestion & Quality Gate', desc: 'Validates resolution, blur, fps, brightness & stability' },
  { id: 2, name: 'Homography Calibration Grid', desc: 'Maps camera pixels to ground plane (meters)' },
  { id: 3, name: 'Pass 1 Screening (~5 FPS)', desc: 'Identifies co-occurring road user candidate windows' },
  { id: 4, name: 'Pass 2 Native Deep Tracking', desc: 'YOLOv8 + ByteTrack + 3-frame trajectory smoothing & Parquet export' },
  { id: 5, name: 'Conflict Analysis (TTC & PET)', desc: 'Constant-velocity footprint simulation & zone encroachment' },
  { id: 6, name: 'Privacy Anonymization & Evidence', desc: 'Face/plate blurring & 5s clip generation' }
];

export default function ProcessingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval = null;

    const fetchStatus = async () => {
      try {
        const res = await jobService.getJobStatus(jobId);
        setJob(res.data);
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to fetch processing status.');
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <span>Two-Pass Video Processing Engine</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">Job ID: {jobId}</p>
          </div>

          <div>
            {job?.status === 'processing' && (
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-2 font-bold shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>PROCESSING</span>
              </span>
            )}
            {job?.status === 'completed' && (
              <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-2 font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>COMPLETED</span>
              </span>
            )}
            {job?.status === 'failed' && (
              <span className="bg-rose-50 border border-rose-300 text-rose-800 text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-2 font-bold shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>FAILED</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-600 mb-2 font-medium">
            <span className="font-semibold text-slate-800">{job?.current_stage || 'Initializing video pipeline...'}</span>
            <span className="font-mono text-blue-700 font-bold">{job?.progress_percent || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full shadow-xs"
              style={{ width: `${job?.progress_percent || 0}%` }}
            />
          </div>
        </div>

        {/* Stepped Stage Breakdown */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Calibrated Pipeline Execution Stages</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PIPELINE_STAGES.map((stg) => {
              const isPast = (job?.progress_percent || 0) >= (stg.id * 16.6);
              const isCurrent = (job?.progress_percent || 0) >= ((stg.id - 1) * 16.6) && !isPast && job?.status === 'processing';
              return (
                <div
                  key={stg.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isPast
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs ring-1 ring-blue-200'
                      : 'bg-slate-50/80 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`font-semibold text-xs ${isPast ? 'text-emerald-900' : isCurrent ? 'text-blue-900 font-bold' : 'text-slate-600'}`}>
                      {stg.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">{stg.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {job?.error_message && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-900">Processing Interrupted</span>
              <p className="mt-0.5 text-rose-700">{job.error_message}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          {job?.status === 'completed' && (
            <button
              onClick={() => navigate('/events')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center space-x-2"
            >
              <span>Inspect Candidate Conflict Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
