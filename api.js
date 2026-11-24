import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const videoService = {
  uploadVideo: (formData) => api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
};

export const jobService = {
  getJobStatus: (jobId) => api.get(`/jobs/${jobId}`),
};

export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEventDetails: (eventId) => api.get(`/events/${eventId}`),
  reviewEvent: (eventId, payload) => api.post(`/events/${eventId}/review`, payload),
};

export const hotspotService = {
  getHotspots: () => api.get('/hotspots'),
};

export const reportService = {
  getReport: (locationId) => api.get(`/reports/${locationId}`),
  downloadReportUrl: (locationId) => `/api/reports/${locationId}/download`,
};

export const calibrationService = {
  getCalibration: (cameraId) => api.get(`/calibrations/${cameraId}`),
  createCalibration: (payload) => api.post('/calibrations', payload),
};

export default api;
