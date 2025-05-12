import Redis from 'ioredis';

// Environment variable with default
const REDIS_QUEUE_URL = process.env.REDIS_QUEUE_URL || 'redis://localhost:6380';

// Create Redis client for queue
export const redisQueue = new Redis(REDIS_QUEUE_URL);

// Stream name
export const DISCORD_STREAM = "discord_stream";

// Send message to Discord stream
export async function sendDiscordMessage(message: Record<string, string>) {
  // Convert the message object to a flat array of key-value pairs
  // as required by Redis xadd command
  const messageArray: string[] = [];
  for (const [key, value] of Object.entries(message)) {
    messageArray.push(key, value);
  }
  
  // Call xadd with the correct format: XADD stream_name * field1 value1 field2 value2 ...
  await redisQueue.xadd(DISCORD_STREAM, '*', ...messageArray);
}

// Send report message
export async function sendReportMessage(postId: string, postTitle: string, reporterEmail: string) {
  await sendDiscordMessage({
    type: 'report',
    postId,
    postTitle,
    reporterEmail,
    timestamp: new Date().toISOString()
  });
} 