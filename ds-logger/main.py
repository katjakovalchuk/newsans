import redis
import requests
import time
import base64

CONSUL_HOST = "http://consul:8500"

def get_kv(key):
    url = f"{CONSUL_HOST}/v1/kv/{key}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return base64.b64decode(resp.json()[0]["Value"]).decode()
    else:
        raise Exception(f"Failed to fetch {key} from Consul: {resp.status_code}")

# --- Load config from Consul ---
WEBHOOK_URL = get_kv("config/webhook_url")
STREAM_NAME = get_kv("config/stream_name")
GROUP_NAME = get_kv("config/group_name")
CONSUMER_NAME = get_kv("config/consumer_name")

# --- Connect to Redis ---
r = redis.Redis(host="redis-queue", port=6379, decode_responses=True)

# --- Init stream group ---
try:
    r.xgroup_create(STREAM_NAME, GROUP_NAME, id='0', mkstream=True)
except redis.exceptions.ResponseError as e:
    if "BUSYGROUP" not in str(e):
        raise

def send_discord_message(content):
    data = {"content": content}
    resp = requests.post(WEBHOOK_URL, json=data)
    if resp.status_code != 204:
        print(f"Discord error: {resp.status_code} {resp.text}")

# --- Main loop ---
print("Listening for Redis messages...")
while True:
    try:
        messages = r.xreadgroup(GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: ">"}, count=1, block=5000)
        for stream, entries in messages:
            for msg_id, msg_data in entries:
                message = msg_data.get("message", "")
                print(f"Got message: {message}")
                send_discord_message(message)
                r.xack(STREAM_NAME, GROUP_NAME, msg_id)
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(2)

