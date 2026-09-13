const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// This service doesn't serve HTTP application traffic (just /health and /metrics
// themselves) — its real job is consuming RabbitMQ events, so that's what's worth
// measuring: how many messages processed, how many failed, how long each one took (mostly:
// SMTP send latency, its one real external dependency and the most likely thing to go slow).
const messagesProcessed = new client.Counter({
  name: 'notification_messages_processed_total',
  help: 'Total RabbitMQ messages processed, by routing key and outcome',
  labelNames: ['routing_key', 'outcome'], // outcome: 'success' | 'failure' | 'unhandled'
  registers: [register],
});

const messageProcessingDuration = new client.Histogram({
  name: 'notification_message_processing_duration_seconds',
  help: 'Time to process a single message (mostly SMTP send latency)',
  labelNames: ['routing_key'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [register],
});

module.exports = { register, messagesProcessed, messageProcessingDuration };
