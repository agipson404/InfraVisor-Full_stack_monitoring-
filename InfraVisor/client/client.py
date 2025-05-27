import websocket
import threading
import time
import json
import psutil
import jwt

DEVICE_ID = "client-linux-001"
JWT_SECRET = "supersecretkey"
SERVER_WS = "ws://localhost:3001"

# create JWT token to auth with backend
token = jwt.encode({"deviceId": DEVICE_ID}, JWT_SECRET, algorithm="HS256")

# send stats every 5 seconds
def send_stats(ws):
    while True:
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent

        stats_payload = {
            "type": "stats",
            "stats": {
                "cpu": cpu,
                "ram": ram,
                "disk": disk
            }
        }
        print("sending:", stats_payload)

        ws.send(json.dumps(stats_payload))
        time.sleep(5)

def on_open(ws):
    print("Connected to InfraVisor backend")
    auth_msg = {"type": "auth", "token": token}
    ws.send(json.dumps(auth_msg))
    threading.Thread(target=send_stats, args=(ws,), daemon=True).start()

def on_error(ws, error):
    print("WebSocket error:", error)

def on_close(ws, close_status_code, close_msg):
    print("Disconnected")
    
if __name__ == "__main__":
    websocket.enableTrace(False)
    ws = websocket.WebSocketApp(SERVER_WS, on_open=on_open, on_error=on_error, on_close=on_close)
    ws.run_forever()
