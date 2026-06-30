// k6 load test for the zkHelios API. Requires a running API + k6.
//   k6 run apps/api/tests/load/k6.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.API_URL || "http://localhost:4000";

export const options = {
  scenarios: {
    // Baseline: 100 RPS sustained for 5 min (read-heavy).
    baseline: { executor: "constant-arrival-rate", rate: 100, timeUnit: "1s", duration: "5m", preAllocatedVUs: 100, maxVUs: 300 },
    // Stress: ramp to find the breaking point.
    stress: { executor: "ramping-arrival-rate", startRate: 50, timeUnit: "1s", startTime: "5m", stages: [{ target: 500, duration: "3m" }], preAllocatedVUs: 200, maxVUs: 1000 },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500", "p(99)<1000"],
  },
};

export default function () {
  const endpoints = ["/health/ready", "/api/stats/overview", "/api/transactions?limit=25", "/api/proofs?limit=25", "/api/circuits"];
  const url = BASE + endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(url);
  check(res, { "status 2xx/5xx-handled": (r) => r.status < 600 });
  sleep(0.1);
}
