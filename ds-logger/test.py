import redis

# --- Connect to the same redis-queue ---
r = redis.Redis(host="localhost", port=6380, decode_responses=True)

# --- Stream name ---
STREAM_NAME = "discord_stream"

# --- Send message ---
def send_message(msg):
    r.xadd(STREAM_NAME, {"message": msg})
    print(f"Sent: {msg}")

if __name__ == "__main__":
    while True:
        msg = input("Enter message to send to Discord: ").strip()
        if msg:
            send_message(msg)
