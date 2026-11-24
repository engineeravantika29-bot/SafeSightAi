import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import EventReviewPage from './pages/EventReviewPage';
import HotspotDashboardPage from './pages/HotspotDashboardPage';
import ReportPage from './pages/ReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing/:jobId" element={<ProcessingPage />} />
            <Route path="/events" element={<EventReviewPage />} />
            <Route path="/events/:eventId" element={<EventReviewPage />} />
            <Route path="/hotspots" element={<HotspotDashboardPage />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
