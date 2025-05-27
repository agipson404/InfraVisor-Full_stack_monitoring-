import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [token, setToken] = useState('');
  const [devices, setDevices] = useState([]);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [history, setHistory] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);

  const login = async () => {
    const res = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    setToken(data.token);
  };

  const fetchDevices = async () => {
    const res = await fetch('http://localhost:3001/api/devices', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDevices(data);

    const newHistory = { ...history };
    data.forEach((d) => {
      if (!newHistory[d.deviceId]) newHistory[d.deviceId] = [];
      newHistory[d.deviceId].push({
        time: new Date().toLocaleTimeString(),
        cpu: d.stats?.cpu || 0,
        ram: d.stats?.ram || 0,
        disk: d.stats?.disk || 0
      });
      if (newHistory[d.deviceId].length > 10) newHistory[d.deviceId].shift();
    });
    setHistory(newHistory);
  };

  useEffect(() => {
    if (token) {
      fetchDevices();
      const interval = setInterval(fetchDevices, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col gap-4 p-8 max-w-sm mx-auto mt-20">
        <h1 className="text-xl font-bold">InfraVisor Login</h1>
        <input className="border px-2 py-1" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="border px-2 py-1" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">InfraVisor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((d, i) => (
          <div key={i} className="bg-zinc-800 p-4 rounded-xl shadow space-y-2">
            <h2 className="font-semibold cursor-pointer" onClick={() => setSelectedDevice(d)}>{d.deviceId}</h2>
            <p><b>CPU:</b> {d.stats?.cpu ?? '-'}%</p>
            <p><b>RAM:</b> {d.stats?.ram ?? '-'}%</p>
            <p><b>Disk:</b> {d.stats?.disk ?? '-'}%</p>
            <p className="text-xs text-gray-400">Last Seen: {new Date(d.lastSeen).toLocaleTimeString()}</p>
            {history[d.deviceId] && (
              <div className="pt-4">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={history[d.deviceId]}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#60A5FA" dot={false} />
                    <Line type="monotone" dataKey="ram" stroke="#34D399" dot={false} />
                    <Line type="monotone" dataKey="disk" stroke="#F87171" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedDevice && (
        <div className="mt-8 p-4 bg-zinc-900 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Logs: {selectedDevice.deviceId}</h2>
          <div className="h-64 overflow-y-auto text-sm space-y-1 bg-black p-4 rounded border border-zinc-700">
            {selectedDevice.logs?.slice().reverse().map((log, idx) => (
              <div key={idx} className="text-green-400 font-mono">{log}</div>
            )) || <p className="text-gray-500">No logs</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
