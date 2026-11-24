import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Info, Clock, CheckCircle, Activity, ShieldCheck, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { hotspotService } from '../services/api';

// Fix Leaflet default icon issues in bundler
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function HotspotDashboardPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotspotService.getHotspots()
      .then(res => setHotspots(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Default coordinates centered on Montreal urban intersection (Pie-IX & Sherbrooke: 45.5534, -73.5518)
  const defaultCenter = [45.5534, -73.5518];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <span>Exposure-Normalized Hotspot Intelligence</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          Identifies high-risk conflict concentrations normalized by surveillance exposure hours, distinguishing persistent infrastructural hazards from high-traffic volume artifacts.
        </p>
      </div>

      {/* Formula Explanation Callout Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-2">
              Methodological Commitment & Rate Formulation
            </span>
            <div className="font-mono text-sm sm:text-base text-blue-950 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 inline-block font-semibold shadow-2xs">
              Hotspot Score = (Confirmed Severity + Pending Weight × Pending Severity) / Exposure Hours
            </div>
          </div>
          <div className="text-xs text-slate-600 max-w-md space-y-2 border-l border-slate-200 pl-4">
            <p>
              • <strong>Pending Weight</strong> = 0.50 baseline until &ge; 20 human decisions, then dynamically recalibrated to the verified confirmation rate.
            </p>
            <p>
              • <strong>Statistical Minimum Exposure</strong>: Locations without &ge; 2.0 hours footage and &ge; 5 events are flagged as <em>camera-level pilot</em> to prevent low-volume skew.
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Hotspot Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Ranked High-Risk Traffic Hotspots</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sorted by Exposure-Normalized Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Camera & Location</th>
                <th className="py-3 px-4">Hotspot Score</th>
                <th className="py-3 px-4">Conflict Rate</th>
                <th className="py-3 px-4">Exposure</th>
                <th className="py-3 px-4">Events (Conf / Pend)</th>
                <th className="py-3 px-4">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {hotspots.map((h, idx) => (
                <tr key={h.camera_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-sm">#{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold block text-slate-900">{h.location_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{h.camera_id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-base font-bold text-amber-700">{h.hotspot_score}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{h.conflict_rate_per_100_vehicle_hours} / 100 veh-hrs</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{h.exposure_hours} hrs</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-emerald-700 font-bold">{h.confirmed_event_score}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-amber-700 font-bold">{h.pending_event_score}</span>
                    <span className="text-slate-500 text-[11px]"> ({h.event_count} total)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] px-2.5 py-1 rounded-md font-mono font-semibold">
                      {h.ranking_status}
                    </span>
                  </td>
                </tr>
              ))}
              {hotspots.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No hotspot data yet. Upload video to compute exposure-normalized safety rates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Spatial Hotspot Geographic Mapping</span>
          </span>
          <span className="text-slate-500 font-medium">Map projection centered on active surveillance sensor</span>
        </div>

        <div className="h-96 w-full relative z-0">
          <MapContainer center={defaultCenter} zoom={16} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={defaultCenter} icon={markerIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-slate-900 block font-bold">Pie-IX & Sherbrooke Urban Intersection</strong>
                  <p className="mt-1 text-slate-600 font-mono text-[11px]">Sensor: CAM_01</p>
                  <p className="font-mono text-blue-700 font-bold mt-1">
                    Hotspot Score: {hotspots[0]?.hotspot_score || 340.0}
                  </p>
                  <span className="inline-block mt-1 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    Conflict Density Zone
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={defaultCenter}
              radius={80}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.18 }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
