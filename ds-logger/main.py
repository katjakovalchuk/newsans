import redis
import requests
import time
import base64
import json

CONSUL_HOST = "http://consul:8500"

def get_kv(key, max_retries=30, retry_delay=2):
    """Fetch a key from Consul KV store with retries."""
    retries = 0
    while retries < max_retries:
        try:
            url = f"{CONSUL_HOST}/v1/kv/{key}"
            resp = requests.get(url)
            if resp.status_code == 200:
                return base64.b64decode(resp.json()[0]["Value"]).decode()
            elif resp.status_code == 404:
                print(f"Key '{key}' not found in Consul, retrying in {retry_delay}s ({retries+1}/{max_retries})...", flush=True)
                retries += 1
                time.sleep(retry_delay)
            else:
                print(f"Failed to fetch {key} from Consul: {resp.status_code}, retrying in {retry_delay}s...", flush=True)
                retries += 1
                time.sleep(retry_delay)
        except Exception as e:
            print(f"Error accessing Consul: {e}, retrying in {retry_delay}s...", flush=True)
            retries += 1
            time.sleep(retry_delay)
    
    raise Exception(f"Failed to fetch {key} from Consul after {max_retries} retries")

def get_kv_once(key):
    """Fetch a key from Consul KV store once without retries."""
    try:
        url = f"{CONSUL_HOST}/v1/kv/{key}"
        resp = requests.get(url)
        if resp.status_code == 200:
            return base64.b64decode(resp.json()[0]["Value"]).decode()
        elif resp.status_code == 404:
            return None
        else:
            print(f"Failed to fetch {key} from Consul: {resp.status_code}", flush=True)
            return None
    except Exception as e:
        print(f"Error accessing Consul: {e}", flush=True)
        return None

def set_kv(key, value):
    """Set a key in Consul KV store."""
    try:
        url = f"{CONSUL_HOST}/v1/kv/{key}"
        resp = requests.put(url, data=value)
        if resp.status_code == 200:
            return True
        else:
            print(f"Failed to set {key} in Consul: {resp.status_code}", flush=True)
            return False
    except Exception as e:
        print(f"Error setting key in Consul: {e}", flush=True)
        return False

# --- Hardcoded configuration ---
STREAM_NAME = "discord_stream"
GROUP_NAME = "discord_group"
CONSUMER_NAME = "consumer1"

# --- Ensure webhook URL exists in Consul ---
webhook_url = get_kv_once("config/webhook_url")
if not webhook_url:
    print("Webhook URL not found in Consul, setting placeholder...", flush=True)
    # Placeholder webhook URL - needs to be replaced with a real one
    webhook_url = "https://discord.com/api/webhooks/placeholder/webhook_url"
    if set_kv("config/webhook_url", webhook_url):
        print("Placeholder webhook URL saved to Consul", flush=True)
    else:
        raise Exception("Failed to save webhook URL to Consul")
else:
    print("Webhook URL exists in Consul", flush=True)

# --- Connect to Redis ---
r = redis.Redis(host="redis-queue", port=6379, decode_responses=True)

# --- Init stream group ---
try:
    r.xgroup_create(STREAM_NAME, GROUP_NAME, id='0', mkstream=True)
except redis.exceptions.ResponseError as e:
    if "BUSYGROUP" not in str(e):
        raise

def format_discord_message(msg_data):
    """Format message data for Discord."""
    try:
        post_id = msg_data.get("postId", "Unknown")
        post_title = msg_data.get("postTitle", "Unknown")
        reporter_email = msg_data.get("reporterEmail", "Unknown")
        timestamp = msg_data.get("timestamp", "Unknown")
        
        message = f"**New Report**\n"
        message += f"**Post Title:** {post_title}\n"
        message += f"**Post ID:** {post_id}\n"
        message += f"**Reporter:** {reporter_email}\n"
        message += f"**Timestamp:** {timestamp}"
        
        return message
    except Exception as e:
        print(f"Error formatting Discord message: {e}", flush=True)
        return f"Error processing report: {str(msg_data)}"

def send_discord_message(content):
    # Get the latest webhook URL from Consul for each request
    webhook_url = get_kv_once("config/webhook_url")
    if not webhook_url:
        print("Error: Webhook URL not found in Consul", flush=True)
        return False
    
    data = {"content": content}
    resp = requests.post(webhook_url, json=data)
    if resp.status_code != 204:
        print(f"Discord error: {resp.status_code} {resp.text}", flush=True)
        return False
    return True

# --- Main loop ---
print("Listening for Redis messages...", flush=True)
while True:
    try:
        messages = r.xreadgroup(GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: ">"}, count=1, block=5000)
        for stream, entries in messages:
            for msg_id, msg_data in entries:
                print(f"Got message: {msg_data}", flush=True)
                
                # Format the Discord message based on the report data
                discord_message = format_discord_message(msg_data)
                
                # Send the formatted message to Discord
                send_success = send_discord_message(discord_message)
                
                # Acknowledge the message
                r.xack(STREAM_NAME, GROUP_NAME, msg_id)
    except Exception as e:
        print(f"Error: {e}", flush=True)
        time.sleep(2)

