/**
 * KPSEAS Wilkes – Admin Console (Network version)
 * Also plays the alert audio for the admin when sending
 */

const ADMIN_PIN = '1111';

const pinGate = document.getElementById('pin-gate');
const adminConsole = document.getElementById('admin-console');
const pinInput = document.getElementById('pin-input');
const pinSubmit = document.getElementById('pin-submit');
const pinError = document.getElementById('pin-error');
const sendBtn = document.getElementById('send-btn');
const alertLog = document.getElementById('alert-log');
const adminAudio = document.getElementById('admin-alert-audio');

let isUnlocked = false;

// ----- PIN Gate -----
function unlockAdmin() {
  const entered = pinInput.value.trim();
  if (entered === ADMIN_PIN) {
    pinGate.classList.add('hidden');
    adminConsole.classList.remove('hidden');
    pinError.classList.add('hidden');
    isUnlocked = true;
    initSocket();
  } else {
    pinError.classList.remove('hidden');
    pinInput.value = '';
    pinInput.focus();
  }
}

pinSubmit.addEventListener('click', unlockAdmin);
pinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlockAdmin();
});
pinInput.focus();

// ----- Socket -----
function initSocket() {
  const s = getSocket();

  s.on('connect', () => {
    console.log('Admin connected to server');
    s.emit('register', { role: 'admin' });
  });

  s.on('status', (data) => {
    const badge = document.querySelector('.status-badge');
    if (badge && data.connectedReceivers !== undefined) {
      badge.textContent = `● ${data.connectedReceivers} receiver(s) online`;
    }
  });

  s.on('alert-sent', (data) => {
    if (data.success) {
      addToLog(data.alert);
      sendBtn.textContent = '✓ ALERT SENT';
      sendBtn.disabled = true;

      // Play the same alert audio for the admin
      playAdminAudio(data.alert.audioPath);

      setTimeout(() => {
        sendBtn.textContent = '🚨 SEND ALERT';
        sendBtn.disabled = false;
      }, 2000);
    }
  });

  s.on('error', (err) => {
    alert(err.message || 'Error sending alert');
  });
}

function playAdminAudio(path) {
  if (!adminAudio) return;
  adminAudio.pause();
  adminAudio.currentTime = 0;
  adminAudio.src = path;
  const playPromise = adminAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('Admin audio playback failed:', path, err);
    });
  }
}

// ----- Send Alert -----
sendBtn.addEventListener('click', () => {
  if (!isUnlocked) return;

  const eventCode = document.getElementById('alert-type').value;
  const voice = document.getElementById('voice-select').value;
  const note = document.getElementById('custom-note').value.trim();

  const payload = {
    pin: ADMIN_PIN,
    eventCode,
    eventName: EVENT_NAMES[eventCode] || eventCode,
    voice,
    note,
    audioPath: getAudioPath(eventCode, voice)
  };

  const s = getSocket();
  s.emit('send-alert', payload);
});

function addToLog(payload) {
  const empty = alertLog.querySelector('.empty');
  if (empty) empty.remove();

  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${payload.eventName}</strong>
    <span class="time"> · ${formatTime(payload.timestamp)}</span><br>
    Voice: ${payload.voice.charAt(0).toUpperCase() + payload.voice.slice(1)}
    ${payload.note ? `<br><em>${payload.note}</em>` : ''}
  `;
  alertLog.prepend(li);
}
