
import requests
import json
import os

TB_URL = "http://localhost:8080"
USERNAME = "admin@tenant.org"
PASSWORD = "123456"
DEVICE_NAME = "serra_01"
ACCESS_TOKEN = "r4VcE0Tec7ecIDgw9oEf"

def main():
    # 1. Login
    login_url = f"{TB_URL}/api/auth/login"
    resp = requests.post(login_url, json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    token = resp.json()["token"]
    headers = {"X-Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("Login successful")

    # 2. Check if device exists
    search_url = f"{TB_URL}/api/tenant/devices"
    params = {"textSearch": DEVICE_NAME, "pageSize": 10, "page": 0}
    resp = requests.get(search_url, headers=headers, params=params)
    
    device_id = None
    if resp.status_code == 200:
        data = resp.json()
        for d in data["data"]:
            if d["name"] == DEVICE_NAME:
                device_id = d["id"]["id"]
                print(f"Device found: {device_id}")
                break
    
    # 3. Create device if not exists
    if not device_id:
        create_url = f"{TB_URL}/api/device"
        resp = requests.post(create_url, headers=headers, json={"name": DEVICE_NAME, "type": "saw"})
        if resp.status_code == 200:
            device_id = resp.json()["id"]["id"]
            print(f"Device created: {device_id}")
        else:
            print(f"Failed to create device: {resp.text}")
            return

    # 4. Set Credentials
    cred_url = f"{TB_URL}/api/device/{device_id}/credentials"
    
    # Try GET first to confirm endpoint
    resp = requests.get(cred_url, headers=headers)
    if resp.status_code == 200:
        print(f"Current credentials: {resp.json()}")
        # Check if we need to update
        cc = resp.json()
        if cc.get("credentialsId") == ACCESS_TOKEN:
            print("Credentials already match.")
            return

    # Try POST to /api/device/credentials
    base_cred_url = f"{TB_URL}/api/device/credentials"
    
    payload = {
        "deviceId": {"id": device_id, "entityType": "DEVICE"},
        "credentialsType": "ACCESS_TOKEN",
        "credentialsId": ACCESS_TOKEN,
        "credentialsValue": None 
    }
    
    # If we found existing credentials, add the ID to update them
    if resp.status_code == 200:
        cc = resp.json()
        payload["id"] = cc["id"]

    resp = requests.post(base_cred_url, headers=headers, json=payload)
    
    if resp.status_code == 200:
        print("Credentials set successfully")
    elif resp.status_code == 400: # Maybe already set?
        print(f"Credentials update response: {resp.text}")
    else:
        print(f"Failed to set credentials: {resp.text}")

if __name__ == "__main__":
    main()
