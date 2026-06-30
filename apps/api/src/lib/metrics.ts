import client from "prom-client";

/** Prometheus registry + app metrics. */
export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route", "status"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

export const wsConnectionsActive = new client.Gauge({
  name: "ws_connections_active",
  help: "Active WebSocket connections",
  registers: [registry],
});

export const queueDepth = new client.Gauge({
  name: "bullmq_queue_depth",
  help: "Jobs waiting per queue",
  labelNames: ["queue"],
  registers: [registry],
});

export const proofsIndexed = new client.Counter({
  name: "zkhelios_proofs_indexed_total",
  help: "Proofs indexed",
  labelNames: ["type"],
  registers: [registry],
});

export const signInsTotal = new client.Counter({
  name: "zkhelios_signins_total",
  help: "Successful SIWS sign-ins",
  registers: [registry],
});
