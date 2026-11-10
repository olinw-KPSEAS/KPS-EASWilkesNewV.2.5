/**
 * KPSEAS Wilkes – Receiver Logic (Network version)
 * Forces full-screen takeover when an alert is received
 */

const params = new URLSearchParams(window.location.search);
const role = params.get('role') || 'receiver';

const roleLabel = document.getElementById('role-label');
const roleDisplay = document.getElementById('role-display');
const overlay = document.getElementById('alert-overlay');
const alertBanner = document.getElementById('alert-banner');
const alertTypeDisplay = document.getElementById('alert-type-display');
const alertNote = document.getElementById('alert-note');
const alertVoice = document.getElementById('alert-voice');
const alertTime = document.getElementById('alert-time');
const ackBtn = document.getElementById('ack-btn');
const audioEl = document.getElementById('alert-audio');

const roleNames = {
  teacher: 'Teacher (Classroom Receiver)',
  student: 'Student (Device Receiver)',
  receiver: 'Generic Receiver'
};
roleLabel.textContent = roleNames[role] || 'Receiver';
roleDisplay.textContent = roleNames[role] || role;

const s = getSocket();

s.on('connect', () => {
  console.log('Receiver connected to server');
  s.emit('register', { role });
  const statusCard = document.querySelector('.status-card h2');
  if (statusCard) statusCard.textContent = 'Standing By – Connected';
});

s.on('disconnect', () => {
  const statusCard = document.querySelector('.status-card h2');
  if (statusCard) statusCard.textContent = 'Disconnected – Reconnecting…';
});

s.on('alert', (payload) => {
  showAlert(payload);
});

/**
 * Try to put the page into true browser fullscreen.
 * Note: Browsers often require a previous user gesture.
 * We still attempt it aggressively on alert.
 */
function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function showAlert(payload) {
  // Force fullscreen as soon as alert arrives
  enterFullscreen();

  alertBanner.textContent = payload.eventCode === 'ALLCLEAR' ? 'ALL CLEAR' : 'EMERGENCY ALERT';
  alertTypeDisplay.textContent = payload.eventName;
  alertNote.textContent = payload.note || '';
  alertVoice.textContent = `Voice: ${payload.voice.charAt(0).toUpperCase() + payload.voice.slice(1)}`;
  alertTime.textContent = `Issued: ${formatTime(payload.timestamp)}`;

  if (payload.eventCode === 'ALLCLEAR') {
    overlay.style.background = '#14532d';
    overlay.style.animation = 'none';
  } else {
    overlay.style.background = '';
    overlay.style.animation = '';
  }

  // Make sure overlay is on top and visible
  overlay.classList.remove('hidden');
  overlay.style.zIndex = '99999';

  // Prevent scrolling / interaction underneath
  document.body.style.overflow = 'hidden';

  playAudio(payload.audioPath);
}

function playAudio(path) {
  audioEl.pause();
  audioEl.currentTime = 0;
  audioEl.src = path;

  const playPromise = audioEl.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('Audio playback failed (file may be missing):', path, err);
      tryFallbackBeep();
    });
  }
}

function tryFallbackBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 600);
  } catch (e) {}
}

// Acknowledge → exit fullscreen and hide overlay
ackBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  audioEl.pause();
  audioEl.currentTime = 0;
  exitFullscreen();
});

// Also try to re-enter fullscreen if user somehow leaves it while alert is showing
document.addEventListener('fullscreenchange', () => {
  if (!overlay.classList.contains('hidden') && !document.fullscreenElement) {
    // User exited fullscreen while alert is active — try to go back in
    setTimeout(enterFullscreen, 300);
  }
});
