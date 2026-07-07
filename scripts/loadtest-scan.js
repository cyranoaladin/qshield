/* global __ENV, __ITER, __VU */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    cache_hit: {
      executor: "constant-vus",
      duration: "30s",
      exec: "cacheHit",
      vus: 10,
    },
    cache_miss: {
      executor: "constant-vus",
      duration: "30s",
      exec: "cacheMiss",
      startTime: "35s",
      vus: 50,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

const apiUrl = __ENV.API_URL ?? "http://localhost:3001";
const sharedAddress = "11111111111111111111111111111111";
const rotatingAddresses = [
  "11111111111111111111111111111111",
  "11111111111111111111111111111112",
  "11111111111111111111111111111113",
  "11111111111111111111111111111114",
  "11111111111111111111111111111115",
  "11111111111111111111111111111116",
  "11111111111111111111111111111117",
];

export function cacheHit() {
  scan(sharedAddress);
  sleep(1);
}

export function cacheMiss() {
  scan(rotatingAddresses[(__VU + __ITER) % rotatingAddresses.length]);
  sleep(1);
}

function scan(address) {
  const response = http.post(
    `${apiUrl}/api/v1/scan`,
    JSON.stringify({
      address,
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );

  check(response, {
    "status is 200 or controlled 4xx/5xx": (res) =>
      res.status === 200 || res.status === 400 || res.status === 429 || res.status === 502,
  });
}
