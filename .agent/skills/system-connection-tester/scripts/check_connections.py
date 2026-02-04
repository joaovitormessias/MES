import os
import sys
import time
import socket
import requests
import redis
import psycopg2
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

def print_status(component, status, details=""):
    color = "\033[92m" if status == "PASS" else "\033[91m"
    reset = "\033[0m"
    print(f"[{color}{status}{reset}] {component} {details}")

def check_tcp(host, port, name):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, int(port)))
        if result == 0:
            print_status(name, "PASS", f"({host}:{port})")
            return True
        else:
            print_status(name, "FAIL", f"({host}:{port}) - Port closed or unreachable")
            return False
    except Exception as e:
        print_status(name, "FAIL", f"({host}:{port}) - {e}")
        return False
    finally:
        sock.close()

def check_postgres(host, port, db, user, password, name):
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=db,
            user=user,
            password=password,
            connect_timeout=3
        )
        conn.close()
        print_status(name, "PASS", f"(Authenticated to {db} at {host}:{port})")
        return True
    except Exception as e:
        print_status(name, "FAIL", f"({host}:{port}) - {e}")
        return False

def check_redis(host, port, name):
    try:
        r = redis.Redis(host=host, port=int(port), socket_timeout=2)
        if r.ping():
            print_status(name, "PASS", f"({host}:{port})")
            return True
    except Exception as e:
        print_status(name, "FAIL", f"({host}:{port}) - {e}")
        return False

def check_http(url, name):
    try:
        response = requests.get(url, timeout=3)
        if response.status_code < 500: # Any response < 500 means server is reachable
            print_status(name, "PASS", f"({url}) - Status {response.status_code}")
            return True
        else:
            print_status(name, "FAIL", f"({url}) - Status {response.status_code}")
            return False
    except Exception as e:
        print_status(name, "FAIL", f"({url}) - {e}")
        return False

def main():
    print("--- Starting System Connection Check ---\n")
    
    # 1. TCP Port Checks (Simplest first)
    # MES Postgres (5433 usually for docker mapping, or 5432 internally)
    mes_pg_port = os.getenv("MES_PG_PORT", 5433) 
    check_tcp("localhost", mes_pg_port, "MES Postgres Port")
    
    # MES Redis
    mes_redis_port = os.getenv("MES_REDIS_PORT", 6379)
    check_tcp("localhost", mes_redis_port, "MES Redis Port")

    # MQTT
    mqtt_port = os.getenv("MQTT_PORT", 1884) # Mosquitto external
    check_tcp("localhost", mqtt_port, "MQTT Broker Port")

    # 2. Application Layer Checks
    print("\n--- Application Layer Checks ---")

    # MES Postgres Auth
    check_postgres(
        "localhost", mes_pg_port, 
        os.getenv("POSTGRES_DB", "mes_renar"),
        os.getenv("POSTGRES_USER", "mes_user"),
        os.getenv("POSTGRES_PASSWORD", "mes_password"),
        "MES Postgres Auth"
    )

    # MES Redis PING
    check_redis("localhost", mes_redis_port, "MES Redis Ping")

    # MES API Health
    mes_api_url = os.getenv("MES_API_URL", "http://localhost:3050") 
    
    # 1. Health
    check_http(f"{mes_api_url}/health", "MES API Health")

    # 2. Ops (should be 401 or 200, but reachable)
    # /ops usually requires auth, but getting a 401 means the route exists and service is up.
    # checking /api/ops might return 404 if it expects ID, but let's try a safe one or just root of ops if defined
    check_http(f"{mes_api_url}/ops", "MES API Ops Route (Expect 404/401)")

    # 3. IoT
    check_http(f"{mes_api_url}/iot/health", "MES IoT Health (if exists)")
    
    # Digital Twin Postgres
    dt_pg_port = os.getenv("DT_PG_PORT", 5432) # Default mapping might conflict if not changed, usually 5432 is taken by system postgres or other. 
                                                # Based on docker-compose, dt-postgres is 5432:5432? 
                                                # MES is 5433:5432. 
                                                # Let's check docker-compose again mentally:
                                                # mes-postgres: 5433:5432
                                                # dt-postgres: 5432:5432
    check_postgres(
        "localhost", dt_pg_port,
        "digital_twin", "twin", "twinpass",
        "DT Postgres Auth"
    )

    print("\n--- Check Complete ---")

if __name__ == "__main__":
    main()
