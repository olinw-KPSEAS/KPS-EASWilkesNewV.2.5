/**
 * KPSEAS Wilkes – Shared Application Logic (Network version)
 * Uses Socket.io so alerts reach every device on the network
 */

/** Human-readable names for event codes */
const EVENT_NAMES = {
  TOR: 'Tornado Warning',
  SVR: 'Severe Thunderstorm Warning',
  FFW: 'Flash Flood Warning',
  WSW: 'Winter Storm Warning',
  HUW: 'Hurricane Warning',
  TOA: 'Tornado Watch',
  SVA: 'Severe Thunderstorm Watch',
  SPS: 'Special Weather Statement',
  LOCKDOWN: 'LOCKDOWN',
  FIRE: 'Fire / Evacuation',
  MEDICAL: 'Medical Emergency',
  SHELTER: 'Shelter in Place',
  EVAC: 'Evacuation',
  ALLCLEAR: 'All Clear',
  CEM: 'Civil Emergency Message',
  RWT: 'Required Weekly Test / System Test'
};

/**
 * Build the expected audio file path
 */
function getAudioPath(eventCode, voice) {
  return `audio/messages/${eventCode}_${voice}.wav`;
}

/**
 * Format a timestamp for display
 */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Socket.io connection (shared)
let socket = null;

function getSocket() {
  if (!socket) {
    // Connect to the same host that served the page
    socket = io({
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}
