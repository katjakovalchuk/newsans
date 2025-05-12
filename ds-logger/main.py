import redis
import requests
import time

# --- Config ---
WEBHOOK_URL = "https://discord.com/api/webhooks/1371375830818750604/kcQ6-x5vhb-5GgYqcqRSKcILTHDBCmBpf8S6sn4-bRfDMZcPhDIZna7sqFNDXHk4pSm2"
STREAM_NAME = "discord_stream"
GROUP_NAME = "discord_group"
CONSUMER_NAME = "consumer1"

# --- Connect to Redis ---
r = redis.Redis(host="redis-queue", port=6379, decode_responses=True)

# Try to create group (ignore if exists)
try:
    r.xgroup_create(STREAM_NAME, GROUP_NAME, id='0', mkstream=True)
except redis.exceptions.ResponseError as e:
    if "BUSYGROUP" not in str(e):
        raise

# --- Send to Discord ---
def send_discord_message(content):
    data = {"content": content}
    resp = requests.post(WEBHOOK_URL, json=data)
    if resp.status_code != 204:
        print(f"Discord error: {resp.status_code} {resp.text}")

# --- Main Loop ---
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

