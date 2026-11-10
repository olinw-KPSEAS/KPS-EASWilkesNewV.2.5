# KPSEAS Wilkes Emergency Alerting System

**Network-ready prototype** (no SAME / EAS tones — only pre-recorded TTS)

Front-office staff can send pre-recorded Paul-voice alerts that appear as full-screen takeovers on every teacher and student device connected to the school network.

---

## Quick Start (School Network)

### 1. Install & run the server (one computer)

```bash
cd kpseas-wilkes
npm install
npm start
```

The server will print something like:

```
Local:   http://localhost:3000
Network: http://192.168.1.50:3000   ← use this on other devices
```

### 2. On every computer / Chromebook / tablet

Open the network address shown above in a browser:

- Front Office → click **Admin** → enter PIN `1111`
- Teachers → click **Teacher**
- Students → click **Student**

When the Front Office sends an alert, **every open receiver** on the network gets the full-screen alert + your pre-recorded message plays automatically.

---

## Features

- Works across the entire local network (not just one browser)
- Admin PIN: **1111**
- Teachers & students are automatic receivers
- Real-time via Socket.io
- Shows how many receivers are currently online
- Pre-recorded Paul TTS messages included

---

## Included Audio (Paul voice)

| Alert                        | File              |
|-----------------------------|-------------------|
| Tornado Warning             | TOR_paul.wav      |
| Tornado Watch               | TOA_paul.wav      |
| Severe Thunderstorm Warning | SVR_paul.wav      |
| Special Weather Statement   | SPS_paul.wav      |
| Flash Flood Warning         | FFW_paul.wav      |
| All Clear                   | ALLCLEAR_paul.wav |
| Required Weekly Test        | RWT_paul.wav      |

Add more files later using the pattern: `EVENTCODE_paul.wav`

---

## Requirements

- Node.js 18 or newer
- Any modern browser (Chrome, Edge, Firefox, Safari)
- Devices must be on the same network as the server computer

---

## Notes

This is a prototype for demonstration and internal testing.  
It does **not** control real PA systems, desktop agents, or physical beacon lights.  
Those require additional authorized hardware and school IT integration.

