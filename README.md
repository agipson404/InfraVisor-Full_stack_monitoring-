# 🛰️ InfraVisor
**Created By:** Arthur Gipson  
📺 **YouTube Video:** [https://youtu.be/d28OVuhgGQE](https://youtu.be/d28OVuhgGQE)

Built using Node.js, React, Python, WebSockets, MongoDB, TailwindCSS, and Recharts, **InfraVisor** is a full-stack infrastructure monitoring tool designed to run on Linux-based systems, enabling real-time telemetry, log streaming, and remote device management.

---

## 📦 Features
- 🧠 Node.js backend with WebSocket & REST API
- 🐍 Python client to push live stats (CPU, RAM, Disk)
- ⚛️ React dashboard with login & charts (JWT auth)
- 📊 Recharts for live graphs
- 📜 Log viewer per device

---

## 🚀 Quick Start (Manual Mode)

### 1. Start MongoDB
```bash
sudo systemctl start mongodb
```

### 2. Run Backend
```bash
cd backend
node server.js
```

### 3. Run Client
```bash
cd client
source venv/bin/activate
python3 client.py
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Then visit: `http://localhost:5173`

> Login: `admin` / `password`

---

Ensure no local MongoDB is already using port 27017.

---

## 📂 Folder Structure
```
InfraVisor/
├── backend/     # Express + WebSocket + JWT + Mongo
├── client/       # Python3 + psutil + websocket-client
├── frontend/    # React + Tailwind + Recharts
```

---

## 📜 Log Message Format
Client can push logs like this:
```json
{
  "type": "log",
  "log": "apt upgrade completed"
}
```

They are stored in MongoDB and viewable per-device in the UI.

---

## 💡 Future Ideas
- Remote shell / command execution
- Add docker

---

MIT License
