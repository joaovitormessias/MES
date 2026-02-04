import json
import os
import time
import requests
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
MQTT_HOST = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "v1/devices/me/telemetry")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")

MES_BASE_URL = os.getenv("MES_BASE_URL", "http://localhost:3050/api/v1")
MES_TOKEN = os.getenv("MES_TOKEN", "")
MES_OP_ID = os.getenv("MES_OP_ID", "")
MES_STEP_ID = os.getenv("MES_STEP_ID", "")

# Thresholds
TEMP_THRESHOLD = float(os.getenv("TEMPERATURE_THRESHOLD", 80.0))
VIB_THRESHOLD = float(os.getenv("VIBRATION_THRESHOLD", 10.0))

# State
current_status = None
last_wood_count = 0

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def send_mes_request(endpoint, method="POST", data=None):
    url = f"{MES_BASE_URL}/ops/{MES_OP_ID}/steps/{MES_STEP_ID}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {MES_TOKEN}",
        "Content-Type": "application/json"
    }
    try:
        if method == "POST":
            response = requests.post(url, json=data, headers=headers)
        else:
            response = requests.get(url, headers=headers)
        
        print(f"Sent {method} to {url}. Status: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error response: {response.text}")
    except Exception as e:
        print(f"Failed to send request to MES: {e}")

def process_metrics(payload):
    global current_status, last_wood_count
    
    # Extract fields
    status = payload.get("status")
    wood_count = payload.get("woodCount")
    temperature = payload.get("temperature")
    vibration = payload.get("vibration")

    # 1. Status Transitions
    if status and status != current_status:
        print(f"Status changed: {current_status} -> {status}")
        if status == "running":
            send_mes_request("start")
        elif current_status == "running" and status != "running":
            send_mes_request("complete")
        current_status = status

    # 2. Wood Count Increments
    if wood_count is not None:
        try:
            wood_count = int(wood_count)
            # Initialize last_wood_count on first run if needed, or assume 0
            # Ideally we might want to fetch initial state or just track increments locally
            # strictly following prompt logic: "Calculate difference... if positive call count"
            if wood_count > last_wood_count:
                diff = wood_count - last_wood_count
                # Avoid huge jumps on restart if simulator count is high (optional check)
                if diff < 1000: 
                    send_mes_request("count", data={"count": diff})
                last_wood_count = wood_count
        except ValueError:
            pass

    # 3. Quality / Anomalies
    if temperature and float(temperature) > TEMP_THRESHOLD:
        print(f"High Temperature Detected: {temperature}")
        send_mes_request("quality", data={
            "code": "HIGH_TEMP",
            "reason": f"Temperature {temperature} exceeded threshold {TEMP_THRESHOLD}"
        })

    if vibration and float(vibration) > VIB_THRESHOLD:
        print(f"High Vibration Detected: {vibration}")
        send_mes_request("quality", data={
            "code": "HIGH_VIBRATION",
            "reason": f"Vibration {vibration} exceeded threshold {VIB_THRESHOLD}"
        })

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        # print(f"Received message: {payload}")
        process_metrics(payload)
    except Exception as e:
        print(f"Error processing message: {e}")

def main():
    client = mqtt.Client()
    
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to MQTT at {MQTT_HOST}:{MQTT_PORT}...")
    try:
        client.connect(MQTT_HOST, MQTT_PORT, 60)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    client.loop_forever()

if __name__ == "__main__":
    main()
