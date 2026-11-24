import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Video, Eye, MapPin, FileText } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { name: 'Upload & Quality Gate', path: '/upload', icon: Video },
    { name: 'Incident Review', path: '/events', icon: Eye },
    { name: 'Hotspot Intelligence', path: '/hotspots', icon: MapPin },
    { name: 'Safety Audit Report', path: '/reports', icon: FileText },
  ];

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">SafeSight AI</span>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] px-2 py-0.5 rounded font-mono font-medium">Round 3 MVP</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Near-Miss Screening & Human Verification</p>
          </div>
        </div>

        <nav className="flex space-x-1 sm:space-x-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
