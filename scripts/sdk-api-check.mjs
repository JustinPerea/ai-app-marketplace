#!/usr/bin/env node
// Simple script to verify SDK endpoints with mocked and live modes

import fetch from 'node-fetch';

const base = process.env.APP_URL || 'http://localhost:3001';

async function main() {
  const results = [];

  const steps = [
    { name: 'sdk-test GET mock', url: `${base}/api/sdk-test?mock=1` },
    { name: 'sdk-test POST mock', url: `${base}/api/sdk-test?mock=1`, method: 'POST', body: { request: { messages: [{ role: 'user', content: 'Hello' }] } } },
  { name: 'provider health', url: `${base}/api/provider-health${process.env.CLI_HEALTH_TOKEN ? `?token=${process.env.CLI_HEALTH_TOKEN}` : ''}` },
    { name: 'edge mock', url: `${base}/api/sdk-test-edge?mock=1` }
  ];

  for (const s of steps) {
    try {
      const res = await fetch(s.url, {
        method: s.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: s.body ? JSON.stringify(s.body) : undefined
      });
      const json = await res.json();
      results.push({ name: s.name, status: res.status, ok: res.ok, json });
    } catch (e) {
      results.push({ name: s.name, error: String(e) });
    }
  }

  console.log(JSON.stringify({ base, results }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});



