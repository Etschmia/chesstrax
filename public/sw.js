// Simple service worker for ChessTrax
const CACHE_NAME = 'chesstrax-v0.2.0';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Skip waiting to immediately take control
  self.skipWaiting();
});

// Activate event  
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Message event to handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Fetch event (basic pass-through for now)
self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // In a full implementation, you'd add caching logic here
  return;
});