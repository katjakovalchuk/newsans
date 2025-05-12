curl --request PUT \
  --data 'https://discord.com/api/webhooks/...' \
  http://localhost:8500/v1/kv/config/webhook_url

curl --request PUT --data 'discord_stream' http://localhost:8500/v1/kv/config/stream_name
curl --request PUT --data 'discord_group'  http://localhost:8500/v1/kv/config/group_name
curl --request PUT --data 'consumer1'      http://localhost:8500/v1/kv/config/consumer_name
