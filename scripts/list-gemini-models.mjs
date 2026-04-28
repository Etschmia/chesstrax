#!/usr/bin/env node
// Lists models available for the current Gemini API key.
// Usage:  node scripts/list-gemini-models.mjs
// Reads GEMINI_API_KEY from the environment, falling back to .env.local.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const loadEnvLocal = () => {
  try {
    const text = readFileSync(resolve(root, '.env.local'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      }
    }
  } catch { /* no .env.local — fine */ }
};

loadEnvLocal();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set (env or .env.local).');
  process.exit(1);
}

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
if (!res.ok) {
  console.error(`Gemini API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const { models = [] } = await res.json();
for (const m of models) {
  const id = m.name.replace(/^models\//, '');
  const methods = (m.supportedGenerationMethods || []).join(',');
  console.log(`${id.padEnd(40)}  ${m.displayName ?? ''}  [${methods}]`);
}
console.log(`\n${models.length} models.`);
